import { useAppStore } from './app'
import { usePermissionStore } from './permission'
import { usePyMeterStore } from './pymeter'
import { useSettingsStore } from './settings'
import { useUserStore } from './user'
import { useWorkspaceStore } from './workspace'

export default function useStore() {
  return {
    app: useAppStore(),
    permission: usePermissionStore(),
    pymeter: usePyMeterStore(),
    settings: useSettingsStore(),
    user: useUserStore(),
    workspace: useWorkspaceStore()
  }
}
