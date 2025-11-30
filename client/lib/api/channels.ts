// src/lib/api/channels.ts
import api from "@/lib/api";
import { Channel } from "@/types/shared";

export async function fetchChannels(workspaceId: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.get<Channel[]>(`/channels/${workspaceId}`, {
    headers,
  });
  return data;
}

export async function createChannelApi(
  name: string,
  workspaceId: string,
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.post<Channel>(
    "/channels",
    { name, workspaceId },
    { headers }
  );
  return data;
}

export async function renameChannelApi(
  channelId: string,
  newName: string,
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.patch(
    `/channels/${channelId}`,
    { name:newName },
    { headers }
  );
  return data;
}

export async function archiveChannelApi(channelId: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.patch(
    `/channels/${channelId}/archive`,
    {},
    { headers }
  );
  return data;
}

export async function deleteChannelApi(channelId: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await api.delete(`/channels/${channelId}`, { headers });
  return data;
}
