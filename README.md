# Face-SDK-Javascript

<a target="_blank" href="https://t.me/jareddean"><img src="https://img.shields.io/badge/telegram-prenes-green.svg?logo=telegram " alt="www.prenes.org"></a>
<a target="_blank" href="https://wa.me/+14422295661"><img src="https://img.shields.io/badge/whatsapp-prenes-green.svg?logo=whatsapp " alt="www.prenes.org"></a>
<a target="_blank" href="https://join.slack.com/t/prenes/shared_invite/zt-1cx925fip-vL4nKJN64XBMbx8vdwHP7Q"><img src="https://img.shields.io/badge/slack-prenes-green.svg?logo=slack " alt="www.prenes.org"></a>

This is a javascript package for face recognition components.

## How it works

## Installation
```
npm install face-recognition-plugin
```

### Examples
- Vue3

```
cd example/vue
npm install face-recognition-plugin
node post-install.js
npm run dev
```
## Documentation

Here are some useful documentation:
### Face Detection
Load detection model
```
loadDetectionModel()
```
Detect face in the image
```
detectFace(session, canvas_id)
```

![fd_result](https://user-images.githubusercontent.com/82228271/184420486-8284f6d2-10fa-47fd-a625-cf15956d32d4.png)


### Face Landmark Extraction
Load landmark extraction model
```
loadLandmarkModel()
```
Extract face landmark in the image using detection result
```
predictLandmark(session, canvas_id, bbox)
```

![fl_result](https://user-images.githubusercontent.com/82228271/184420510-a7b71a90-0fcc-4534-9bcc-15e3af2e9fce.png)

### Face Liveness Detection
Load liveness detection model
```
loadLivenessModel()
```
Detect face liveness in the image using detection result. (Anti-spoofing)
```
predictLiveness(session, canvas_id, bbox)
```

![fa_result](https://user-images.githubusercontent.com/82228271/184953255-9cb7b3d2-864c-4a15-a1f1-3e0dea8b6792.png)

### Face Expression Detection
Load expression detection model
```
loadExpressionModel()
```
Detect face expression
```
predictExpression(session, canvas_id, bbox)
```

### Face Pose Estimation
Load pose estimation model
```
loadPoseModel()
```
Predict facial pose
```
predictPose(session, canvas_id, bbox, question)
```

### Eye Closeness Detection
Load eye closeness model
```
loadPoseModel()
```
Predict eye closeness
```
predictEye(session, canvas_id, landmark)
```

### Face Recognition

