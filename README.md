<div align="center">
<img alt="faceplugin" src="https://github.com/faceplugin/Face-Recognition-SDK-Javascript/assets/82228271/cab95553-8881-41ca-b37d-a0606877c942">
</div>


<div align="left">
<img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome Badge"/>
<img src="https://img.shields.io/static/v1?label=%F0%9F%8C%9F&message=If%20Useful&style=style=flat&color=BC4E99" alt="Star Badge"/>
<img src="https://img.shields.io/github/issues/genderev/assassin" alt="issue"/>
<img src="https://img.shields.io/github/issues-pr/genderev/assassin" alt="pr"/>
<a href="https://www.producthunt.com/posts/face-recognition-javascript-sdk?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-face&#0045;recognition&#0045;javascript&#0045;sdk" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=357308&theme=light" alt="Face&#0032;Recognition&#0032;Javascript&#0032;SDK - This&#0032;product&#0032;includes&#0032;components&#0032;for&#0032;facial&#0032;recognition&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</div>

<details open>
<summary><h2>How it works</h2></summary>

https://user-images.githubusercontent.com/82228271/187199680-208c7995-21b1-48d7-8758-3977452ff955.mp4

</details>

<details open>
<summary><h2>Installation</h2></summary>

```bash
npm install faceplugin
```

</details>

<details open>
<summary><h2>Table of Contents</h2></summary>

* **[Face Detection](#face-detection)**
* **[Face Landmark Extraction](#face-landmark-extraction)**
* **[Face Liveness Detection](#face-expression-detection)**
* **[Face Expression Detection](#face-expression-detection)**
* **[Face Pose Estimation](#face-pose-estimation)**
* **[Eye Closeness Detection](#eye-closeness-detection)**
* **[Gender Detection](#gender-detection)**
* **[Age Detection](#age-detection)**
* **[Face Feature Embedding](#face-recognition)**

</details>

<details open>
<summary><h2>Examples</h2></summary>

* [Vue.js Demo](https://github.com/AI-Innovator/Face-Recognition-SDK-Demo-Vue)
* [React.js Demo](https://github.com/AI-Innovator/Face-Recognition-SDK-Demo-React)

</details>

<details>
<summary><h2>Documentation</h2></summary>

Here are some useful documentation

<a name="face-detection"></a>
### Face Detection
Load detection model
```
loadDetectionModel()
```
Detect face in the image
```
detectFace(session, canvas_id)
```

<a name="face-landmark-extraction"></a>
### Face Landmark Extraction
Load landmark extraction model
```
loadLandmarkModel()
```
Extract face landmark in the image using detection result
```
predictLandmark(session, canvas_id, bbox)
```

<a name="face-liveness-detection"></a>
### Face Liveness Detection
Load liveness detection model
```
loadLivenessModel()
```
Detect face liveness in the image using detection result. (Anti-spoofing)
```
predictLiveness(session, canvas_id, bbox)
```

<a name="face-expression-detection"></a>
### Face Expression Detection
Load expression detection model
```
loadExpressionModel()
```
Detect face expression
```
predictExpression(session, canvas_id, bbox)
```

<a name="face-pose-estimation"></a>
### Face Pose Estimation
Load pose estimation model
```
loadPoseModel()
```
Predict facial pose
```
predictPose(session, canvas_id, bbox, question)
```

<a name="eye-closeness-detection"></a>
### Eye Closeness Detection
Load eye closeness model
```
loadEyeModel()
```
Predict eye closeness
```
predictEye(session, canvas_id, landmark)
```

<a name="gender-detection"></a>
### Gender Detection
Load gender detection model
```
loadGenderModel()
```
Predict gender using face image
```
predictGender(session, canvas_id, landmark)
```

<a name="age-detection"></a>
### Age Detection
Load age detection model
```
loadAgeModel()
```
Predict age using face image
```
predictAge(session, canvas_id, landmark)
```

<a name="face-recognition"></a>
### Face Recognition
Load feature extraction model
```
loadFeatureModel()
```
Extract face feature vector in 512 dimension
```
extractFeature(session, canvas_id, landmarks)
```

</details>

