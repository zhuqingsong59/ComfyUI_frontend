import axios from 'axios'

import type {
  EmbeddingsResponse,
  ExecutedWsMessage,
  ExecutingWsMessage,
  ExecutionCachedWsMessage,
  ExecutionErrorWsMessage,
  ExecutionInterruptedWsMessage,
  ExecutionStartWsMessage,
  ExecutionSuccessWsMessage,
  ExtensionsResponse,
  HistoryTaskItem,
  LogsRawResponse,
  LogsWsMessage,
  PendingTaskItem,
  ProgressWsMessage,
  PromptResponse,
  RunningTaskItem,
  Settings,
  StatusWsMessage,
  StatusWsMessageStatus,
  SystemStats,
  User,
  UserDataFullInfo
} from '@/schemas/apiSchema'
import type {
  ComfyApiWorkflow,
  ComfyWorkflowJSON,
  NodeId
} from '@/schemas/comfyWorkflowSchema'
import {
  type ComfyNodeDef,
  validateComfyNodeDef
} from '@/schemas/nodeDefSchema'
import { WorkflowTemplates } from '@/types/workflowTemplateTypes'
import { generateUUID, getToken } from '@/utils/custom'

interface QueuePromptRequestBody {
  client_id: string
  prompt_id: string
  prompt: ComfyApiWorkflow
  extra_data: {
    extra_pnginfo: {
      workflow: ComfyWorkflowJSON
    }
    /**
     * The auth token for the comfy org account if the user is logged in.
     *
     * Backend node can access this token by specifying following input:
     * ```python
      @classmethod
      def INPUT_TYPES(s):
        return {
          "hidden": { "auth_token": "AUTH_TOKEN_COMFY_ORG"}
        }

      def execute(self, auth_token: str):
        print(f"Auth token: {auth_token}")
     * ```
     */
    auth_token_comfy_org?: string
  }
  front?: boolean
  number?: number
}

/** Dictionary of Frontend-generated API calls */
interface FrontendApiCalls {
  graphChanged: ComfyWorkflowJSON
  promptQueued: { number: number; batchCount: number }
  graphCleared: never
  reconnecting: never
  reconnected: never
}

/** Dictionary of calls originating from ComfyUI core */
interface BackendApiCalls {
  progress: ProgressWsMessage
  executing: ExecutingWsMessage
  executed: ExecutedWsMessage
  status: StatusWsMessage
  execution_start: ExecutionStartWsMessage
  execution_success: ExecutionSuccessWsMessage
  execution_error: ExecutionErrorWsMessage
  execution_interrupted: ExecutionInterruptedWsMessage
  execution_cached: ExecutionCachedWsMessage
  logs: LogsWsMessage
  /** Mr Blob Preview, I presume? */
  b_preview: Blob
}

/** Dictionary of all api calls */
interface ApiCalls extends BackendApiCalls, FrontendApiCalls { }

/** Used to create a discriminating union on type value. */
interface ApiMessage<T extends keyof ApiCalls> {
  type: T
  data: ApiCalls[T]
}

export class UnauthorizedError extends Error { }

/** Ensures workers get a fair shake. */
type Unionize<T> = T[keyof T]

/**
 *  Discriminated union of generic, i.e.:
 * ```ts
 * // Convert
 * type ApiMessageUnion = ApiMessage<'status' | 'executing' | ...>
 * // To
 * type ApiMessageUnion = ApiMessage<'status'> | ApiMessage<'executing'> | ...
 * ```
 */
type ApiMessageUnion = Unionize<{
  [Key in keyof ApiCalls]: ApiMessage<Key>
}>

/** Wraps all properties in {@link CustomEvent}. */
type AsCustomEvents<T> = {
  readonly [K in keyof T]: CustomEvent<T[K]>
}

/** Handles differing event and API signatures. */
type ApiToEventType<T = ApiCalls> = {
  [K in keyof T]: K extends 'status'
  ? StatusWsMessageStatus
  : K extends 'executing'
  ? NodeId
  : T[K]
}

/** Dictionary of types used in the detail for a custom event */
type ApiEventTypes = ApiToEventType<ApiCalls>

/** Dictionary of API events: `[name]: CustomEvent<Type>` */
type ApiEvents = AsCustomEvents<ApiEventTypes>

/** {@link Omit} all properties that evaluate to `never`. */
type NeverNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K]
}

/** {@link Pick} only properties that evaluate to `never`. */
type PickNevers<T> = {
  [K in keyof T as T[K] extends never ? K : never]: T[K]
}

/** Keys (names) of API events that _do not_ pass a {@link CustomEvent} `detail` object. */
type SimpleApiEvents = keyof PickNevers<ApiEventTypes>
/** Keys (names) of API events that pass a {@link CustomEvent} `detail` object. */
type ComplexApiEvents = keyof NeverNever<ApiEventTypes>

/** EventTarget typing has no generic capability. */
export interface ComfyApi extends EventTarget {
  addEventListener<TEvent extends keyof ApiEvents>(
    type: TEvent,
    callback: ((event: ApiEvents[TEvent]) => void) | null,
    options?: AddEventListenerOptions | boolean
  ): void

  removeEventListener<TEvent extends keyof ApiEvents>(
    type: TEvent,
    callback: ((event: ApiEvents[TEvent]) => void) | null,
    options?: EventListenerOptions | boolean
  ): void
}

export class PromptExecutionError extends Error {
  response: PromptResponse

  constructor(response: PromptResponse) {
    super('Prompt execution failed')
    this.response = response
  }

  override toString() {
    let message = ''
    if (typeof this.response.error === 'string') {
      message += this.response.error
    } else if (this.response.error) {
      message +=
        this.response.error.message + ': ' + this.response.error.details
    }

    for (const [_, nodeError] of Object.entries(
      this.response.node_errors ?? []
    )) {
      message += '\n' + nodeError.class_type + ':'
      for (const errorReason of nodeError.errors) {
        message += '\n    - ' + errorReason.message + ': ' + errorReason.details
      }
    }

    return message
  }
}

export class ComfyApi extends EventTarget {
  #registered = new Set()
  api_host: string
  api_base: string
  /**
   * The client id from the initial session storage.
   */
  initialClientId: string | null
  /**
   * The current client id from websocket status updates.
   */
  clientId?: string
  /**
   * The current user id.
   */
  user: string
  socket: WebSocket | null = null
  promptId?: string
  axiosOption: any
  reportedUnknownMessageTypes = new Set<string>()

  constructor() {
    super()
    this.user = ''
    this.api_host = location.host
    // this.api_base = location.pathname.split('/').slice(0, -1).join('/')
    this.api_base = '/comfyuiServer'
    console.log('this.api_base: ', this.api_base);
    console.log('Running on', this.api_host)
    this.axiosOption = {
      headers: {
        'Dabi-token': getToken() || ''
      }
    }
    this.initialClientId = sessionStorage.getItem('clientId')
  }

  /**
   * 设置 API 基础路径
   * @param base 新的 API 基础路径
   */
  setApiBase(base: string): void {
    this.api_base = this.api_base + base
  }

  internalURL(route: string): string {
    return this.api_base + (process.env.NODE_ENV === 'development' ? '/internal' : '/internal/internal') + route
  }

  apiURL(route: string): string {
    return this.api_base + '/api' + route
  }

  dabiURL(route: string): string {
    return (import.meta.env.VITE_DABI_URL || '/dabi/test') + route
  }

  fileURL(route: string): string {
    return this.api_base + route
  }

  fetchApi(route: string, options?: RequestInit) {
    if (!options) {
      options = {}
    }
    if (!options.headers) {
      options.headers = {}
    }
    if (!options.cache) {
      options.cache = 'no-cache'
    }

    const token = getToken() || ''
    if (Array.isArray(options.headers)) {
      options.headers.push(['Comfy-User', this.user])
      options.headers.push(['Dabi-token', token])
    } else if (options.headers instanceof Headers) {
      options.headers.set('Comfy-User', this.user)
      options.headers.set('Dabi-token', token)
    } else {
      options.headers['Comfy-User'] = this.user
      options.headers['Dabi-token'] = token
    }
    return fetch(this.apiURL(route), options)
  }

  addEventListener<TEvent extends keyof ApiEvents>(
    type: TEvent,
    callback: ((event: ApiEvents[TEvent]) => void) | null,
    options?: AddEventListenerOptions | boolean
  ) {
    // Type assertion: strictFunctionTypes.  So long as we emit events in a type-safe fashion, this is safe.
    super.addEventListener(type, callback as EventListener, options)
    this.#registered.add(type)
  }

  removeEventListener<TEvent extends keyof ApiEvents>(
    type: TEvent,
    callback: ((event: ApiEvents[TEvent]) => void) | null,
    options?: EventListenerOptions | boolean
  ): void {
    super.removeEventListener(type, callback as EventListener, options)
  }

  /**
   * Dispatches a custom event.
   * Provides type safety for the contravariance issue with EventTarget (last checked TS 5.6).
   * @param type The type of event to emit
   * @param detail The detail property used for a custom event ({@link CustomEventInit.detail})
   */
  dispatchCustomEvent<T extends SimpleApiEvents>(type: T): boolean
  dispatchCustomEvent<T extends ComplexApiEvents>(
    type: T,
    detail: ApiEventTypes[T] | null
  ): boolean
  dispatchCustomEvent<T extends keyof ApiEventTypes>(
    type: T,
    detail?: ApiEventTypes[T]
  ): boolean {
    const event =
      detail === undefined
        ? new CustomEvent(type)
        : new CustomEvent(type, { detail })
    return super.dispatchEvent(event)
  }

  /** @deprecated Use {@link dispatchCustomEvent}. */
  dispatchEvent(event: never): boolean {
    return super.dispatchEvent(event)
  }

  /**
   * Poll status  for colab and other things that don't support websockets.
   */
  #pollQueue() {
    setInterval(async () => {
      try {
        const resp = await this.fetchApi('/prompt')
        const status = (await resp.json()) as StatusWsMessageStatus
        this.dispatchCustomEvent('status', status)
      } catch (error) {
        this.dispatchCustomEvent('status', null)
      }
    }, 1000)
  }

  /**
   * Creates and connects a WebSocket for realtime updates
   * @param {boolean} isReconnect If the socket is connection is a reconnect attempt
   */
  #createSocket(isReconnect?: boolean) {
    if (this.socket) {
      return
    }

    let opened = false
    let existingSession = window.name
    if (existingSession) {
      existingSession = '?clientId=' + existingSession
    }
    this.socket = new WebSocket(
      `ws${window.location.protocol === 'https:' ? 's' : ''}://${this.api_host}/comfyuiws/ws${existingSession}`
    )
    this.socket.binaryType = 'arraybuffer'

    this.socket.addEventListener('open', () => {
      opened = true
      if (isReconnect) {
        this.dispatchCustomEvent('reconnected')
      }
    })

    this.socket.addEventListener('error', () => {
      if (this.socket) this.socket.close()
      if (!isReconnect && !opened) {
        this.#pollQueue()
      }
    })

    this.socket.addEventListener('close', () => {
      setTimeout(() => {
        this.socket = null
        this.#createSocket(true)
      }, 300)
      if (opened) {
        this.dispatchCustomEvent('status', null)
        this.dispatchCustomEvent('reconnecting')
      }
    })

    this.socket.addEventListener('message', (event) => {
      try {
        if (event.data instanceof ArrayBuffer) {
          const view = new DataView(event.data)
          const eventType = view.getUint32(0)
          const buffer = event.data.slice(4)
          switch (eventType) {
            case 1:
              const view2 = new DataView(event.data)
              const imageType = view2.getUint32(0)
              let imageMime
              switch (imageType) {
                case 1:
                default:
                  imageMime = 'image/jpeg'
                  break
                case 2:
                  imageMime = 'image/png'
              }
              const imageBlob = new Blob([buffer.slice(4)], {
                type: imageMime
              })
              this.dispatchCustomEvent('b_preview', imageBlob)
              break
            default:
              throw new Error(
                `Unknown binary websocket message of type ${eventType}`
              )
          }
        } else {
          const msg = JSON.parse(event.data) as ApiMessageUnion
          switch (msg.type) {
            case 'status':
              if (msg.data.sid) {
                const clientId = msg.data.sid
                this.clientId = clientId
                window.name = clientId // use window name so it isnt reused when duplicating tabs
                sessionStorage.setItem('clientId', clientId) // store in session storage so duplicate tab can load correct workflow
              }
              this.dispatchCustomEvent('status', msg.data.status ?? null)
              break
            case 'executing':
              this.dispatchCustomEvent(
                'executing',
                msg.data.display_node || msg.data.node
              )
              break
            case 'execution_start':
            case 'execution_error':
            case 'execution_interrupted':
            case 'execution_cached':
            case 'execution_success':
            case 'progress':
            case 'executed':
            case 'graphChanged':
            case 'promptQueued':
            case 'logs':
            case 'b_preview':
              this.dispatchCustomEvent(msg.type, msg.data)
              break
            default:
              if (this.#registered.has(msg.type)) {
                // Fallback for custom types - calls super direct.
                super.dispatchEvent(
                  new CustomEvent(msg.type, { detail: msg.data })
                )
              } else if (!this.reportedUnknownMessageTypes.has(msg.type)) {
                this.reportedUnknownMessageTypes.add(msg.type)
                throw new Error(`Unknown message type ${msg.type}`)
              }
          }
        }
      } catch (error) {
        console.warn('Unhandled message:', event.data, error)
      }
    })
  }

  /**
   * Initialises sockets and realtime updates
   */
  init() {
    this.#createSocket()
  }

  /**
   * Gets a list of extension urls
   */
  async getExtensions(): Promise<ExtensionsResponse> {
    const resp = await this.fetchApi('/extensions', { cache: 'no-store' })
    return await resp.json()
  }

  /**
   * Gets the available workflow templates from custom nodes.
   * @returns A map of custom_node names and associated template workflow names.
   */
  async getWorkflowTemplates(): Promise<{
    [customNodesName: string]: string[]
  }> {
    const res = await this.fetchApi('/workflow_templates')
    return await res.json()
  }

  /**
   * Gets the index of core workflow templates.
   */
  async getCoreWorkflowTemplates(): Promise<WorkflowTemplates[]> {
    const res = await axios.get(this.fileURL('/templates/index.json'))
    const contentType = res.headers['content-type']
    return contentType?.includes('application/json') ? res.data : []
  }

  /**
   * Gets a list of embedding names
   */
  async getEmbeddings(): Promise<EmbeddingsResponse> {
    const resp = await this.fetchApi('/embeddings', { cache: 'no-store' })
    return await resp.json()
  }

  /**
   * Loads node object definitions for the graph
   * @returns The node definitions
   */
  async getNodeDefs({ validate = false }: { validate?: boolean } = {}): Promise<
    Record<string, ComfyNodeDef>
  > {
    const resp = await this.fetchApi('/object_info', { cache: 'no-store' })
    const objectInfoUnsafe = await resp.json()
    if (!validate) {
      return objectInfoUnsafe
    }
    // Validate node definitions against zod schema. (slow)
    const objectInfo: Record<string, ComfyNodeDef> = {}
    for (const key in objectInfoUnsafe) {
      const validatedDef = validateComfyNodeDef(
        objectInfoUnsafe[key],
        /* onError=*/(errorMessage: string) => {
          console.warn(
            `Skipping invalid node definition: ${key}. See debug log for more information.`
          )
          console.debug(errorMessage)
        }
      )
      if (validatedDef !== null) {
        objectInfo[key] = validatedDef
      }
    }
    return objectInfo
  }

  /**
   * 获取图库分页列表（POST 请求，使用 axios）
   * @param {Object} params 包含分页参数的对象
   * @param {number} params.pageNo 页码
   * @param {number} params.pageSize 每页大小
   * @param {number} params.mediaType 媒体类型
   * @param {number} params.folderId 文件夹 ID
   * @returns {Promise<any>} 返回分页数据
   */
  async getGalleryFilesByPage(params: { pageNo: number; pageSize: number, mediaType: number, folderId: number }): Promise<any> {
    const route = '/comfyflow/listFilesByPage';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch gallery files: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching gallery files:', error);
      throw error;
    }
  }

  /**
   * 获取ossCode列表的url
   * @param {Object} params 包含代码列表的对象
   * @param {Array<string>} params.codeList 代码列表
   * @returns {Promise<any>} 返回代码列表的url
   */
  async getOssCodeUrl(params: { codeList: Array<string> }): Promise<any> {
    const route = '/comfy/image/batchGetUrl';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch gallery files: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching gallery files:', error);
      throw error;
    }
  }

  /**
  * 收藏图片
  * @param {Object} params 包含图片code的对象
  * @param {string} params.code 图片code
  * @returns {Promise<any>} 返回代码列表的url
  */
  async collectImage(params: { code: string }): Promise<any> {
    const route = '/image/library/collect';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to collect image: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error collect image:', error);
      throw error;
    }
  }
  /**
  * 取消收藏图片
  * @param {Object} params 包含图片code的对象
  * @param {Array<string>} params.ids 代码列表
  * @returns {Promise<any>} 返回代码列表的url
  */
  async cancelCollectImage(params: { ids: Array<string> }): Promise<any> {
    const route = '/image/library/delete';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to cancel collect image: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error cancel collect image:', error);
      throw error;
    }
  }

  /**
   * 删除图库图片
   * @param {Object} params 包含图片code的对象
   *@param {Array<number>} params.ids 代码列表
   *@param {number} params.mediaType 媒体类型
   * @returns {Promise<any>} 返回代码列表的url
   */
  async deleteGalleryImage(params: { ids: Array<number>, mediaType: number }): Promise<any> {
    const route = '/comfyflow/delFile';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to delete gallery image: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error delete gallery image:', error);
      throw error;
    }
  }

  /**
   * Queues a prompt to be executed
   * @param {number} number The index at which to queue the prompt, passing -1 will insert the prompt at the front of the queue
   * @param {object} prompt The prompt data to queue
   * @param {string} authToken The auth token for the comfy org account if the user is logged in
   * @throws {PromptExecutionError} If the prompt fails to execute
   */
  async queuePrompt(
    number: number,
    data: { output: ComfyApiWorkflow; workflow: ComfyWorkflowJSON },
    authToken?: string
  ): Promise<PromptResponse> {
    const { output: prompt, workflow } = data
    this.promptId = generateUUID()
    const body: QueuePromptRequestBody = {
      client_id: this.clientId ?? '', // TODO: Unify clientId access
      prompt_id: this.promptId,
      prompt,
      extra_data: {
        auth_token_comfy_org: authToken,
        extra_pnginfo: { workflow }
      }
    }

    if (number === -1) {
      body.front = true
    } else if (number != 0) {
      body.number = number
    }

    const res = await this.fetchApi('/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (res.status !== 200) {
      throw new PromptExecutionError(await res.json())
    }

    return await res.json()
  }

  /**
   * Gets a list of model folder keys (eg ['checkpoints', 'loras', ...])
   * @returns The list of model folder keys
   */
  async getModelFolders(): Promise<{ name: string; folders: string[] }[]> {
    const res = await this.fetchApi(`/experiment/models`)
    if (res.status === 404) {
      return []
    }
    const folderBlacklist = ['configs', 'custom_nodes']
    return (await res.json()).filter(
      (folder: string) => !folderBlacklist.includes(folder)
    )
  }

  /**
   * Gets a list of models in the specified folder
   * @param {string} folder The folder to list models from, such as 'checkpoints'
   * @returns The list of model filenames within the specified folder
   */
  async getModels(
    folder: string
  ): Promise<{ name: string; pathIndex: number }[]> {
    const res = await this.fetchApi(`/experiment/models/${folder}`)
    if (res.status === 404) {
      return []
    }
    return await res.json()
  }

  /**
   * Gets the metadata for a model
   * @param {string} folder The folder containing the model
   * @param {string} model The model to get metadata for
   * @returns The metadata for the model
   */
  async viewMetadata(folder: string, model: string) {
    const res = await this.fetchApi(
      `/view_metadata/${folder}?filename=${encodeURIComponent(model)}`
    )
    const rawResponse = await res.text()
    if (!rawResponse) {
      return null
    }
    try {
      return JSON.parse(rawResponse)
    } catch (error) {
      console.error(
        'Error viewing metadata',
        res.status,
        res.statusText,
        rawResponse,
        error
      )
      return null
    }
  }

  /**
   * Loads a list of items (queue or history)
   * @param {string} type The type of items to load, queue or history
   * @returns The items of the specified type grouped by their status
   */
  async getItems(type: 'queue' | 'history') {
    if (type === 'queue') {
      return this.getQueue()
    }
    return this.getHistory()
  }

  /**
   * Gets the current state of the queue
   * @returns The currently running and queued items
   */
  async getQueue(): Promise<{
    Running: RunningTaskItem[]
    Pending: PendingTaskItem[]
  }> {
    try {
      const res = await this.fetchApi('/queue')
      const data = await res.json()
      return {
        // Running action uses a different endpoint for cancelling
        Running: data.queue_running.map((prompt: Record<number, any>) => ({
          taskType: 'Running',
          prompt,
          remove: { name: 'Cancel', cb: () => api.interrupt() }
        })),
        Pending: data.queue_pending.map((prompt: Record<number, any>) => ({
          taskType: 'Pending',
          prompt
        }))
      }
    } catch (error) {
      console.error(error)
      return { Running: [], Pending: [] }
    }
  }

  /**
   * Gets the prompt execution history
   * @returns Prompt history including node outputs
   */
  async getHistory(
    max_items: number = 200
  ): Promise<{ History: HistoryTaskItem[] }> {
    try {
      const res = await this.fetchApi(`/history?max_items=${max_items}`)
      const json: Promise<HistoryTaskItem[]> = await res.json()
      return {
        History: Object.values(json).map((item) => ({
          ...item,
          taskType: 'History'
        }))
      }
    } catch (error) {
      console.error(error)
      return { History: [] }
    }
  }

  /**
   * Gets system & device stats
   * @returns System stats such as python version, OS, per device info
   */
  async getSystemStats(): Promise<SystemStats> {
    const res = await this.fetchApi('/system_stats')
    return await res.json()
  }

  /**
   * Sends a POST request to the API
   * @param {*} type The endpoint to post to
   * @param {*} body Optional POST data
   */
  async #postItem(type: string, body: any) {
    try {
      await this.fetchApi('/' + type, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Deletes an item from the specified list
   * @param {string} type The type of item to delete, queue or history
   * @param {number} id The id of the item to delete
   */
  async deleteItem(type: string, id: string) {
    await this.#postItem(type, { delete: [id] })
  }

  /**
   * Clears the specified list
   * @param {string} type The type of list to clear, queue or history
   */
  async clearItems(type: string) {
    await this.#postItem(type, { clear: true })
  }

  /**
   * Interrupts the execution of the running prompt
   */
  async interrupt() {
    await this.#postItem('interrupt', { prompt_id: this.promptId })
  }

  /**
   * Gets user configuration data and where data should be stored
   */
  async getUserConfig(): Promise<User> {
    return (await this.fetchApi('/users')).json()
  }

  /**
   * Creates a new user
   * @param { string } username
   * @returns The fetch response
   */
  createUser(username: string) {
    return this.fetchApi('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
  }

  /**
   * Gets all setting values for the current user
   * @returns { Promise<string, unknown> } A dictionary of id -> value
   */
  async getSettings(): Promise<Settings> {
    const resp = await this.fetchApi('/settings')

    if (resp.status == 401) {
      throw new UnauthorizedError(resp.statusText)
    }
    return await resp.json()
  }

  /**
   * Gets a setting for the current user
   * @param { string } id The id of the setting to fetch
   * @returns { Promise<unknown> } The setting value
   */
  async getSetting(id: keyof Settings): Promise<Settings[keyof Settings]> {
    return (await this.fetchApi(`/settings/${encodeURIComponent(id)}`)).json()
  }

  /**
   * Stores a dictionary of settings for the current user
   */
  async storeSettings(settings: Settings) {
    return this.fetchApi(`/settings`, {
      method: 'POST',
      body: JSON.stringify(settings)
    })
  }

  /**
   * Stores a setting for the current user
   */
  async storeSetting(id: keyof Settings, value: Settings[keyof Settings]) {
    return this.fetchApi(`/settings/${encodeURIComponent(id)}`, {
      method: 'POST',
      body: JSON.stringify(value)
    })
  }

  /**
   * Gets a user data file for the current user
   */
  async getUserData(file: string, options?: RequestInit) {
    return this.fetchApi(`/userdata/${encodeURIComponent(file)}`, options)
  }

  /**
   * Stores a user data file for the current user
   * @param { string } file The name of the userdata file to save
   * @param { unknown } data The data to save to the file
   * @param { RequestInit & { stringify?: boolean, throwOnError?: boolean } } [options]
   * @returns { Promise<Response> }
   */
  async storeUserData(
    file: string,
    data: any,
    options: RequestInit & {
      overwrite?: boolean
      stringify?: boolean
      throwOnError?: boolean
      full_info?: boolean
    } = {
        overwrite: true,
        stringify: true,
        throwOnError: true,
        full_info: false
      }
  ): Promise<Response> {
    const resp = await this.fetchApi(
      `/userdata/${encodeURIComponent(file)}?overwrite=${options.overwrite}&full_info=${options.full_info}`,
      {
        method: 'POST',
        body: options?.stringify ? JSON.stringify(data) : data,
        ...options
      }
    )
    if (resp.status !== 200 && options.throwOnError !== false) {
      throw new Error(
        `Error storing user data file '${file}': ${resp.status} ${(await resp).statusText}`
      )
    }

    return resp
  }

  /**
   * Deletes a user data file for the current user
   * @param { string } file The name of the userdata file to delete
   */
  async deleteUserData(file: string) {
    const resp = await this.fetchApi(`/userdata/${encodeURIComponent(file)}`, {
      method: 'DELETE'
    })
    return resp
  }

  /**
   * Move a user data file for the current user
   * @param { string } source The userdata file to move
   * @param { string } dest The destination for the file
   */
  async moveUserData(
    source: string,
    dest: string,
    options = { overwrite: false }
  ) {
    const resp = await this.fetchApi(
      `/userdata/${encodeURIComponent(source)}/move/${encodeURIComponent(dest)}?overwrite=${options?.overwrite}`,
      {
        method: 'POST'
      }
    )
    return resp
  }

  /**
   * @overload
   * Lists user data files for the current user
   * @param { string } dir The directory in which to list files
   * @param { boolean } [recurse] If the listing should be recursive
   * @param { true } [split] If the paths should be split based on the os path separator
   * @returns { Promise<string[][]> } The list of split file paths in the format [fullPath, ...splitPath]
   */
  /**
   * @overload
   * Lists user data files for the current user
   * @param { string } dir The directory in which to list files
   * @param { boolean } [recurse] If the listing should be recursive
   * @param { false | undefined } [split] If the paths should be split based on the os path separator
   * @returns { Promise<string[]> } The list of files
   */
  async listUserData(
    dir: string,
    recurse: boolean,
    split?: true
  ): Promise<string[][]>
  async listUserData(
    dir: string,
    recurse: boolean,
    split?: false
  ): Promise<string[]>
  /**
   * @deprecated Use `listUserDataFullInfo` instead.
   */
  async listUserData(dir: string, recurse: boolean, split?: boolean) {
    const resp = await this.fetchApi(
      `/userdata?${new URLSearchParams({
        recurse: recurse ? 'true' : 'false',
        dir,
        split: split ? 'true' : 'false'
      })}`
    )
    if (resp.status === 404) return []
    if (resp.status !== 200) {
      throw new Error(
        `Error getting user data list '${dir}': ${resp.status} ${resp.statusText}`
      )
    }
    return resp.json()
  }

  async listUserDataFullInfo(dir: string): Promise<UserDataFullInfo[]> {
    const resp = await this.fetchApi(
      `/userdata?dir=${encodeURIComponent(dir)}&recurse=true&split=false&full_info=true`
    )
    if (resp.status === 404) return []
    if (resp.status !== 200) {
      throw new Error(
        `Error getting user data list '${dir}': ${resp.status} ${resp.statusText}`
      )
    }
    return resp.json()
  }

  async getLogs(): Promise<string> {
    return (await axios.get(this.internalURL('/logs'), this.axiosOption)).data
  }

  async getRawLogs(): Promise<LogsRawResponse> {
    return (await axios.get(this.internalURL('/logs/raw'))).data
  }

  async subscribeLogs(enabled: boolean): Promise<void> {
    return await axios.patch(this.internalURL('/logs/subscribe'), {
      enabled,
      clientId: this.clientId
    })
  }

  async getFolderPaths(): Promise<Record<string, string[]>> {
    return (await axios.get(this.internalURL('/folder_paths'))).data
  }

  /**
   * Gets the custom nodes i18n data from the server.
   *
   * @returns The custom nodes i18n data
   */
  async getCustomNodesI18n(): Promise<Record<string, any>> {
    return (await axios.get(this.apiURL('/i18n'), this.axiosOption)).data
  }

  /**
   * 新工作流列表接口
   * @returns {Promise<any[]>} 工作流列表
   */
  async getNewWorkflowList(): Promise<any[]> {
    const resp = await this.fetchApi('/dapi/listFlow')
    if (resp.status !== 200) {
      throw new Error(`获取工作流列表失败: ${resp.status} ${resp.statusText}`)
    }
    return resp.json()
  }

  /**
   * 新保存工作流接口
   * @param data 保存的数据
   */
  async saveNewWorkflow(data: any): Promise<any> {
    const resp = await this.fetchApi('/dapi/saveFlow', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (resp.status !== 200) {
      throw new Error(`保存工作流失败: ${resp.status} ${resp.statusText}`)
    }
    return resp.json()
  }
  /**
   * 获取指定ID的工作流详情
   * @param {number|string} id 工作流ID
   * @returns {Promise<any>} 工作流详情
   */
  async getNewWorkflowById(id: number | string): Promise<any> {
    const url = this.apiURL('/dapi/getFlow')
    try {
      const response = await axios.post(
        url,
        { id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      )
      if (response.status !== 200) {
        throw new Error(`获取工作流失败: ${response.status} ${response.statusText}`)
      }
      return response.data
    } catch (error) {
      console.error('获取工作流失败:', error)
      throw error
    }
  }

  /**
   * 更新工作流
   * @param {Object} params 更新工作流的参数
   * @param {string} params.id 工作流ID
   * @param {string} params.name 工作流名称
   * @param {string} [params.content] 可选的工作流内容
   * @returns {Promise<any>} 更新结果
   */
  async updateWorkflow(params: { id: string; name: string; content?: string }): Promise<any> {
    const url = this.apiURL('/dapi/updateFlow');
    try {
      const response = await axios.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`更新工作流失败: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('更新工作流失败:', error);
      throw error;
    }
  }

  /**
   * 删除工作流
   * @param {string} id 工作流ID
   * @returns {Promise<any>} 删除结果
   */
  async deleteWorkflow(id: string): Promise<any> {
    const url = this.apiURL('/dapi/delFlow');
    try {
      const response = await axios.post(
        url,
        { id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`删除工作流失败: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('删除工作流失败:', error);
      throw error;
    }
  }
  /**
   * 获取可用服务（POST 请求，使用 axios）
   * @returns {Promise<any>} 返回分页数据
   */
  async getServer(): Promise<any> {
    const route = '/comfyflow/getServer';
    const url = this.dabiURL(route);
    try {
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Dabi-token': getToken() || ''
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to get server: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Failed to get server:', error);
      throw error;
    }
  }

}

export const api = new ComfyApi()
