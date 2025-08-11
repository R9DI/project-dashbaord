import { create } from "zustand";

export const useModalStore = create((set) => ({
  // 초기 상태
  isIssueModalVisible: false,
  isColorSettingsModalVisible: false,
  selectedRowData: null,

  // 액션들
  openIssueModal: (data) => {
    console.log("modalStore - openIssueModal 호출됨, data:", data);
    console.log("modalStore - data 타입:", typeof data);
    console.log("modalStore - data.projectId:", data?.projectId);
    console.log("modalStore - data.id:", data?.id);
    set((state) => {
      console.log("modalStore - 이전 상태:", state);
      const newState = {
        isIssueModalVisible: true,
        selectedRowData: data || null,
      };
      console.log("modalStore - 새로운 상태:", newState);
      return newState;
    });
  },

  closeIssueModal: () => {
    console.log("modalStore - closeIssueModal 호출됨");
    set((state) => {
      console.log("modalStore - closeIssueModal - 이전 상태:", state);
      const newState = {
        isIssueModalVisible: false,
        selectedRowData: null,
      };
      console.log("modalStore - closeIssueModal - 새로운 상태:", newState);
      return newState;
    });
  },

  openColorSettingsModal: () =>
    set({
      isColorSettingsModalVisible: true,
    }),

  closeColorSettingsModal: () =>
    set({
      isColorSettingsModalVisible: false,
    }),

  setSelectedRowData: (data) => {
    console.log("modalStore - setSelectedRowData 호출됨, data:", data);
    console.log("modalStore - setSelectedRowData - data 타입:", typeof data);
    console.log(
      "modalStore - setSelectedRowData - data.projectId:",
      data?.projectId
    );
    console.log("modalStore - setSelectedRowData - data.id:", data?.id);
    set({
      selectedRowData: data,
    });
  },
}));
