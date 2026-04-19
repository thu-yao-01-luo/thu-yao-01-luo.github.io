---
permalink: /
title: "About Me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I am a second-year Ph.D. student in the Department of Computer Science and Technology at Tsinghua University, fortunate to be advised by [Prof. Wenguang Chen](https://pacman.cs.tsinghua.edu.cn/~cwg/) in the [PACMAN Lab](https://github.com/thu-pacman). My current research interests and effort include **scaling of language models**, **efficient training**, **open-source pretraining**, and understanding how data curricula and optimization interact during pretraining. I am fortunate to collaborate with [Kaifeng Lyu](https://kaifeng.ac/) and [Shengding Hu](https://shengdinghu.github.io/).

I received my **B.Eng. in Computer Science and Technology** in 2024 from Tsinghua University, where I was a member of the **Yao Class**, headed by Prof. Andrew Chi-Chih Yao. During my undergraduate study, I was fortunately advised by [Li Yi](https://ericyi.github.io/), [Hao Su](https://cseweb.ucsd.edu/~haosu/), and [Wenguang Chen](https://pacman.cs.tsinghua.edu.cn/~cwg/).

---

## Research Interests
- Scaling of language models
- Efficient training
- Open-source pretraining
- Pretraining dynamics, scaling laws, and curriculum design

## Selected Work

### How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining
<img src="/images/research/curriculum-model-averaging-summary.png" alt="Curriculum model averaging summary figure" style="max-width: 520px; width: 100%; border: 1px solid #e5e7eb; border-radius: 12px;">

*Kairong Luo, Zhenbo Sun, Haodong Wen, Xinyu Shi, Jiarui Cui, Chenyi Dang, Kaifeng Lyu, Wenguang Chen*

- **Oral Presentation (Top 1.2%)**, ICLR 2026
- [OpenReview PDF](https://openreview.net/pdf?id=T5wkZJqzkz) | [arXiv](https://arxiv.org/abs/2511.18903)
- We identify a mismatch between ascending-quality curricula and standard learning-rate decay, and show that moderate LR decay together with model averaging can recover the gains of curriculum-based pretraining.

### PCMind-2.1-Kaiyuan-2B Technical Report
<img src="/images/research/kaiyuan-2b-performance.svg" alt="Kaiyuan-2B performance comparison" style="max-width: 520px; width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">

*Kairong Luo, Zhenbo Sun, Xinyu Shi, Shengqi Chen, Bowen Yu, Yunyi Chen, Chenyi Dang, Hengtao Tao, Hui Wang, Fangming Liu, Kaifeng Lyu, Wenguang Chen*

- [Technical Report](https://arxiv.org/abs/2512.07612) | [Model](https://huggingface.co/thu-pacman/PCMind-2.1-Kaiyuan-2B) | [Dataset](https://huggingface.co/datasets/thu-pacman/PCMind-2.1-Kaiyuan-2B) | [Kaiyuan-Spark](https://github.com/thu-pacman/Kaiyuan-Spark) | [kaiyuan-mindformers](https://github.com/thu-pacman/kaiyuan-mindformers/tree/kaiyuan)
- A fully open 2B language model released together with model weights, dataset, data preprocessing pipeline, and training framework.

### A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules
<img src="/images/research/multi-power-law-summary.png" alt="Multi-power law summary figure" style="max-width: 520px; width: 100%; border: 1px solid #e5e7eb; border-radius: 12px;">

*Kairong Luo, Haodong Wen, Shengding Hu, Zhenbo Sun, Zhiyuan Liu, Maosong Sun, Kaifeng Lyu, Wenguang Chen*

- **Accepted by ICLR 2025**
- [arXiv](https://arxiv.org/abs/2503.12811)
- We propose a multi-power law that predicts loss curves across learning-rate schedules and helps identify schedules that outperform widely used defaults such as cosine decay.
