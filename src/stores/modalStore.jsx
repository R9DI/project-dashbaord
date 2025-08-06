import { create } from "zustand";

export const useModalStore = create((set) => ({
  // 초기 상태
  isIssueModalVisible: false,
  isColorSettingsModalVisible: false,
  selectedRowData: null,

  // 액션들
  openIssueModal: (data) =>
    set({
      isIssueModalVisible: true,
      selectedRowData: data || null,
    }),

  closeIssueModal: () =>
    set({
      isIssueModalVisible: false,
      selectedRowData: null,
    }),

  openColorSettingsModal: () =>
    set({
      isColorSettingsModalVisible: true,
    }),

  closeColorSettingsModal: () =>
    set({
      isColorSettingsModalVisible: false,
    }),

  setSelectedRowData: (data) =>
    set({
      selectedRowData: data,
    }),
}));
