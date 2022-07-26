
export default {
    namespaced: true,
    state: {
        opencv_path: "../../../public/js",
        pose_path: "../../model/fr_pose.onnx",
        detection_path: "../model/Mobile0.25.onnx",
        // pose_session: InferenceSession,
        // detect_session: InferenceSession,
        cv: null,
        onnx_config: {
            name: 'Resnet50',
            min_sizes: [[16, 32], [64, 128], [256, 512]],
            steps: [8, 16, 32],
            variance: [0.1, 0.2],
            clip: false,
            loc_weight: 2.0,
            gpu_train: true,
            batch_size: 24,
            ngpu: 4,
            epoch: 100,
            decay1: 70,
            decay2: 90,
            image_size: 800,
            pretrain: true,
            return_layers: {'layer2': 1, 'layer3': 2, 'layer4': 3},
            in_channel: 256,
            out_channel: 256,
            confidence_threshold: 0.05,
            top_k: 5000,
            keep_top_k: 740,
            nms_threshold: 0.4,
            model: ["./model/Mobile0.25.onnx"]
      },
    },
    mutations: {
    },
    actions: {
    },
    getters: {

    }
}
