import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { streamChatViaFetch } from '../services/chatApi';
import type { TingwuChatMessage } from '../types';

interface ChatState {
  messages: TingwuChatMessage[];
  asking: boolean;
  input: string;
}

const initialState: ChatState = {
  messages: [],
  asking: false,
  input: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    initMessages(state, action: PayloadAction<TingwuChatMessage[]>) {
      state.messages = action.payload;
    },
    setChatInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    setAsking(state, action: PayloadAction<boolean>) {
      state.asking = action.payload;
    },
    addMessage(state, action: PayloadAction<TingwuChatMessage>) {
      state.messages.push(action.payload);
    },
    appendToMessage(state, action: PayloadAction<{ id: string; chunk: string }>) {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.content += action.payload.chunk;
      }
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  initMessages,
  setChatInput,
  setAsking,
  addMessage,
  appendToMessage,
  resetChat,
} = chatSlice.actions;

/**
 * 调用 Node 中间层 → DashScope Qwen 流式问答。
 */
export const askQuestionStream = createAsyncThunk(
  'chat/askQuestionStream',
  async (
    payload: { question: string; context: string },
    { dispatch, signal },
  ) => {
    dispatch(setAsking(true));
    dispatch(setChatInput(''));

    const userMsg: TingwuChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: payload.question,
      createdAt: new Date().toISOString(),
    };
    dispatch(addMessage(userMsg));

    const assistantId = `msg-a-${Date.now()}`;
    dispatch(
      addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }),
    );

    try {
      await streamChatViaFetch(
        payload.question,
        payload.context,
        (chunk) => {
          dispatch(appendToMessage({ id: assistantId, chunk }));
        },
        signal,
      );
    } finally {
      dispatch(setAsking(false));
    }
  },
);

export default chatSlice.reducer;
