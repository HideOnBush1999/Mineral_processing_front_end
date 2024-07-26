import { http } from "@/utils/http";

export type TriggerResult = {
  message: string;
};

export const trigger = () => {
  return http.request<TriggerResult>(
    "get",
    "http://127.0.0.1:5005/welcome/trigger"
  );
};
