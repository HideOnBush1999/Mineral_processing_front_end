import { http } from "@/utils/http";

export type TriggerResult = {
  message: string;
};


export type FileUploadResult = { message: string } | { error: string };
export type OnlineTrainResult = { message: string } | { error: string };
export type GetModelListResult = { model_list: string[] } | { error: string };
export type ModelShowResult = { mse: number; r2: number; image: string } | { error: string };
export type DeleteModelResult = { message: string } | { error: string };
export type DownloadModelResult = Blob | { error: string };
export type GrayCorrelationAnalysisResult =
  | {
    message: string;
    relation_results: { Feature: string; RelationDegree: number }[];
    image_base64: string;
  }
  | { error: string };


export const trigger = () => {
  return http.request<TriggerResult>(
    "get",
    "http://127.0.0.1:5005/welcome/trigger"
  );
};

/** 上传文件 */
export const uploadLocalFile = (data: FormData) => {
  return http.request<FileUploadResult>(
    "post",
    "http://127.0.0.1:5005/welcome/file_upload",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 在线随机森林训练 */
export const onlineTrain_rf = (
  dataset_input_name,
  dataset_output_name,
  module_name,
  params // 参数对象
) => {
  return http.request<OnlineTrainResult>(
    "post",
    "http://127.0.0.1:5005/welcome/online_train",
    {
      data: {
        dataset_input_name,
        dataset_output_name,
        module_name,
        n_estimators: params.n_estimators,
        max_depth: params.max_depth,
        min_samples_split: params.min_samples_split,
        min_samples_leaf: params.min_samples_leaf
      }
    }
  );
};

/** 获取模型列表 */
export const getModelList = (module_name: string) => {
  return http.request<GetModelListResult>(
    "post",
    "http://127.0.0.1:5005/welcome/get_model_list",
    {
      data: { module_name }
    }
  );
};


/** 模型展示 */
export const modelShow = (
  dataset_input_name: string,
  dataset_output_name: string,
  module_name: string,
  model_name: string
) => {
  return http.request<ModelShowResult>(
    "post",
    "http://127.0.0.1:5005/welcome/model_show",
    {
      data: { dataset_input_name, dataset_output_name, module_name, model_name }
    }
  );
};

/** 删除模型 */
export const deleteMultiLayerModel = (model_name: string) => {
  return http.request<DeleteModelResult>(
    "post",
    "http://127.0.0.1:5005/welcome/delete",
    {
      data: { model_name }
    }
  );
};

/** 下载模型 */
export const downloadMultiLayerModel = (model_name: string) => {
  return http.request<DownloadModelResult>(
    "get",
    "http://127.0.0.1:5005/welcome/download",
    {
      params: { model_name },
      responseType: "blob"
    }
  );
};


/** 灰度关联分析 */
export const grayCorrelationAnalysis = (data: { dataset_input_name: string; dataset_output_name: string; }) => {
  return http.request<GrayCorrelationAnalysisResult>(
    "post",
    "http://127.0.0.1:5005/welcome/gray_correlation_analysis",
    { data }
  );
};

