import { http } from "@/utils/http";

// modeling
// 上传文件结果类型
export type FileUploadResult = { message: string } | { error: string };

// 在线训练结果类型
export type OnlineTrainResult = { message: string } | { error: string };

// 模型展示结果类型
export type ModelShowResult = { mse: number; r2: number } | { error: string };

// 获取模型列表结果类型
export type GetModelListResult = { model_list: string[] } | { error: string };

// 优化求解结果类型
export type OptimizationSolveResult = { task_id: string } | { error: string };

// 获取优化结果类型
export type OptimizationResult =
  | { state: string; status: string; result?: any }
  | { error: string };

/** 上传文件 */
export const fileUploadInput = (data: FormData) => {
  return http.request<FileUploadResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_modeling/file_upload",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 在线训练 */
export const onlineTrain = (
  dataset_name,
  module_name,
  params // 参数对象
) => {
  return http.request<OnlineTrainResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_modeling/online_train",
    {
      data: {
        dataset_name,
        module_name,
        n_estimators: params.n_estimators,
        max_depth: params.max_depth,
        min_samples_split: params.min_samples_split,
        min_samples_leaf: params.min_samples_leaf
      }
    }
  );
};

/** 模型展示 */
export const modelShow = (
  dataset_name: string,
  module_name: string,
  model_name: string
) => {
  return http.request<ModelShowResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_modeling/model_show",
    {
      data: { dataset_name, module_name, model_name }
    }
  );
};

/** 获取模型列表 */
export const getModelList = (module_name: string) => {
  return http.request<GetModelListResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_modeling/get_model_list",
    {
      data: { module_name }
    }
  );
};

/** 优化求解 */
export const optimizationSolve = (
  dataset_name: string,
  module_name: string,
  model_name: string
) => {
  return http.request<OptimizationSolveResult>(
    "post",
    "http://127.0.0.1:5005/multi_layer_modeling/optimization_solve",
    {
      data: { dataset_name, module_name, model_name }
    }
  );
};

/** 获取优化结果 */
export const getOptimizationResult = (task_id: string) => {
  return http.request<OptimizationResult>(
    "get",
    `http://127.0.0.1:5005/multi_layer_modeling/optimization_result/${task_id}`
  );
};

// ------------------------------------------
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
