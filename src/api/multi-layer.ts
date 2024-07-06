import { http } from "@/utils/http";

// modeling

// manage
// 多层模型管理结果类型
export type MultiLayerModelResult =
  | {
      models: { name: string; size: string }[];
      total: number;
    }
  | { error: string };

// 上传模型结果类型
export type AddModelResult = { message: string } | { error: string };

// 删除模型结果类型
export type DeleteModelResult = { message: string } | { error: string };

// 更新模型结果类型
export type UpdateModelResult = { message: string } | { error: string };

// 搜索模型结果类型
export type SearchModelResult = MultiLayerModelResult;

// 下载模型结果类型
export type DownloadModelResult = Blob | { error: string };

// 分页获取多层模型
export const getMultiLayerModels = (page: number, limit: number) => {
  return http.request<MultiLayerModelResult>(
    "get",
    "http://127.0.0.1:5005/multi_layer_manage/get_multi_layer_models",
    {
      params: { page, limit }
    }
  );
};

/** 上传模型 */
export const addMultiLayerModel = (data: FormData) => {
  return http.request<AddModelResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_manage/add",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除模型 */
export const deleteMultiLayerModel = (model_name: string) => {
  return http.request<DeleteModelResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_manage/delete",
    {
      data: { model_name }
    }
  );
};

/** 更新模型 */
export const updateMultiLayerModel = (old_name: string, new_name: string) => {
  return http.request<UpdateModelResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_manage/update",
    {
      data: { old_name, new_name }
    }
  );
};

/** 搜索模型 */
export const searchMultiLayerModel = (query: string) => {
  return http.request<SearchModelResult>(
    "get",
    "http://127.0.0.1:5005/multi_layer_manage/search",
    {
      params: { query }
    }
  );
};

/** 下载模型 */
export const downloadMultiLayerModel = (model_name: string) => {
  return http.request<DownloadModelResult>(
    "get",
    "http://127.0.0.1:5005/multi_layer_manage/download",
    {
      params: { model_name },
      responseType: "blob"
    }
  );
};
