import { AppStore } from '@/stores/app/index';
import { AgoraWebRtcWrapper, MediaService, AgoraElectronRTCWrapper, StartScreenShareParams, PrepareScreenShareParams, LocalUserRenderer } from 'agora-rte-sdk';
import { observable, computed, action, runInAction } from 'mobx';

export class DeviceSettingStore {
  static resolutions: any[] = [
    {
      name: '480p',
      value: '480p_1',
    },
    {
      name: '720p',
      value: '720p_1',
    },
    {
      name: '1080p',
      value: '1080p_1'
    }
  ]

  @observable
  settingVisible: boolean = false

  @action 
  showSetting() {
    this.settingVisible = true
  }

  @action 
  hideSetting() {
    this.settingVisible = false
  }

  @observable
  activeDeviceItem: string = 'video'

  @action
  setActiveItem(type: string) {
    this.activeDeviceItem = type
  }

  @observable
  cameraTestResult: string = 'default'
  
  @observable
  microphoneTestResult: string = 'default'

  @observable
  speakerTestResult: string = 'default'

  @action
  setCameraTestResult(v: string) {
    this.cameraTestResult = v
  }

  @action
  setMicrophoneTestResult(v: string) {
    this.microphoneTestResult = v
  }

  @action
  setSpeakerTestResult(v: string) {
    this.speakerTestResult = v
  }

  @observable
  resolutionIdx: number = 0

  @observable
  deviceList: any[] = []

  @observable
  cameraLabel: string = '';

  @observable
  microphoneLabel: string = '';
  _totalVolume: any;

  @observable
  _cameraId: string = '';

  @observable
  _microphoneId: string = '';

  @computed
  get cameraId(): string {
    const defaultValue = ''
    const idx = this.cameraList.findIndex((it: any) => it.label === this.cameraLabel)
    if (this.cameraList[idx]) {
      return this.cameraList[idx].deviceId
    }
    return defaultValue
  }

  @computed
  get microphoneId(): string {
    const defaultValue = ''
    const idx = this.microphoneList.findIndex((it: any) => it.label === this.microphoneLabel)
    if (this.microphoneList[idx]) {
      return this.microphoneList[idx].deviceId
    }
    return defaultValue
  }

  @computed
  get speakerId(): string {
    return ''
  }

  @observable
  resolution: string = '480p_1'

  @computed
  get playbackVolume(): number {
    if (this._playbackVolume) {
      return this._playbackVolume
    }
    return this.mediaService.getPlaybackVolume()
  }

  @observable
  _playbackVolume: number = 0

  @action
  changePlaybackVolume(volume: number) {
    this.mediaService.changePlaybackVolume(volume)
    this._playbackVolume = volume
  }

  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;
  @observable
  _microphoneTrack?: any = undefined;
  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @computed
  get totalVolume(): number {
    return this.appStore.mediaStore.totalVolume
  }

  appStore: AppStore;

  constructor(appStore: AppStore) {
    this.appStore = appStore
  }

  @action
  resetCameraTrack () {
    this._cameraRenderer = undefined
  }

  @action
  resetMicrophoneTrack () {
    this._microphoneTrack = undefined
  }

  @action
  reset() {
    this.resolutionIdx = 0
    this.cameraLabel = ''
    this.microphoneLabel = ''
    this.web.reset()
    this.resetCameraTrack()
    this.resetMicrophoneTrack()
    this.activeDeviceItem = 'video'
    this.cameraTestResult = 'default'
    this.microphoneTestResult = 'default'
    this.speakerTestResult = 'default'
  }

  @observable
  _cameraList: any[] = []

  @computed
  get cameraList(): any[] {
    return this._cameraList
      .concat([{
        deviceId: 'unknown',
        label: '禁用',
      }])
  }

  @observable
  _microphoneList: any[] = []

  @computed
  get microphoneList(): any[] {
    return this._microphoneList
      .concat([{
        deviceId: 'unknown',
        label: '禁用',
      }])
  }

  @observable
  speakerList: any[] = []

  init(option: {video?: boolean, audio?: boolean} = {video: true, audio: true}) {
    if (option.video) {
      this.mediaService.getCameras().then((list: any[]) => {
        runInAction(() => {
          this._cameraList = list
        })
      })
    }
    if (option.audio) {
      this.mediaService.getMicrophones().then((list: any[]) => {
        runInAction(() => {
          this._microphoneList = list
        })
      })
    }
  }

  get mediaService(): MediaService {
    return this.appStore.eduManager.mediaService as MediaService;
  }

  get web(): AgoraWebRtcWrapper {
    return (this.mediaService.sdkWrapper as AgoraWebRtcWrapper)
  }

  get isWeb(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  @action
  async openTestCamera() {
    const deviceId = this._cameraId
    await this.mediaService.openTestCamera({deviceId})
    this._cameraRenderer = this.mediaService.cameraTestRenderer
    this.cameraLabel = this.mediaService.getTestCameraLabel()
    this._cameraId = this.cameraId
    this.appStore.deviceInfo.cameraName = this.cameraLabel
  }

  @action
  closeTestCamera() {
    this.mediaService.closeTestCamera()
    this.resetCameraTrack()
  }

  @action
  async changeTestCamera(deviceId: string) {
    await this.mediaService.changeTestCamera(deviceId)
    this._cameraRenderer = this.mediaService.cameraTestRenderer
    this.cameraLabel = this.mediaService.getTestCameraLabel()
    this._cameraId = this.cameraId
    this.appStore.deviceInfo.cameraName = this.cameraLabel
  }

  @action
  async openTestMicrophone() {
    const deviceId = this._microphoneId
    await this.mediaService.openTestMicrophone({deviceId})
    if (this.isWeb) {
      this._microphoneTrack = this.web.microphoneTrack
    }
    this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    this.appStore.deviceInfo.microphoneName = this.microphoneLabel
    this._microphoneId = this.microphoneId
  }

  @action
  closeTestMicrophone() {
    this.mediaService.closeTestMicrophone()
    this.resetMicrophoneTrack()
  }

  @action
  async changeTestMicrophone(deviceId: string) {
    await this.mediaService.changeTestMicrophone(deviceId)
    // this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    // this._microphoneId = deviceId
    if (this.isWeb) {
      this._microphoneTrack = this.web.microphoneTrack
    }
    this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    this.appStore.deviceInfo.microphoneName = this.microphoneLabel
    this._microphoneId = this.microphoneId
  }

  @action
  async changeTestResolution(resolution: any) {
    await this.mediaService.changeTestResolution(resolution)
    runInAction(() => {
      this.resolution = resolution
    })
  }

  @computed
  get speakerLabel(): string {
    if (this.appStore.uiStore.isElectron) {
      return this.appStore.eduManager.mediaService.getSpeakerLabel()
    }
    return '默认'
  }
}