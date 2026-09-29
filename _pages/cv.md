---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

## Education
- **Third-year Ph.D. student in Department of Computer Science and Technology**, Tsinghua University, 2024-2029 (expected)
  - GPA: 4.0/4.0  
- **B.S. in Institute for Interdisciplinary Information Sciences (IIIS)**, Tsinghua University, 2020-2024
  - GPA: 3.95/4.0, Rank: 9/79  

## Publications
1. **Puro-2B: Poor Lab's Qwen2-1.5B Trained on RTX 5090 within $5090**<br>
   ***Kairong Luo**, Jiarui Cui, Yaorui Yin, Shengqi Chen, Yiming Yang, Linxiang Gao, Yanmohan Wang, Chengxia Li, Mingzhe Zhang, Kaifeng Lyu, Wenguang Chen*
   - **Technical Report** (August 2026)
   - Links: [arXiv](https://arxiv.org/abs/2608.27370)
   - **Summary**: This report presents an open, cost-efficient recipe for pretraining 2B language models on consumer-grade RTX 5090 GPUs and releases the training data, code, and model weights.

2. **RoBSA: RoPE-based Blockwise Sparse Multi-head Latent Attention**<br>
   *Xinyu Shi, **Kairong Luo**, Zhen Zheng, Wenguang Chen*
   - <span class="publication-card__badge publication-card__badge--recommended">ACL 2026 · Recommended as Oral</span> (July 2026)
   - **My contributions**: experiment analysis; assistance with paper writing
   - Links: [ACL Anthology](https://aclanthology.org/2026.acl-long.46/)

3. **How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining**<br>
   ***Kairong Luo**, Zhenbo Sun, Haodong Wen, Xinyu Shi, Jiarui Cui, Chenyi Dang, Kaifeng Lyu, Wenguang Chen*
   - <span class="publication-card__badge publication-card__badge--oral">ICLR 2026 · Oral · Top 1.2%</span>
   - Links: [OpenReview PDF](https://openreview.net/pdf?id=T5wkZJqzkz), [arXiv preprint](https://arxiv.org/abs/2511.18903)
   - **Summary**: This paper studies curriculum-based LLM pretraining under mixed-quality data and identifies a key mismatch between ascending-quality curricula and standard learning-rate decay. It shows that moderate LR decay and model averaging recover the gains of curriculum ordering, improving benchmark performance without extra data refinement.

4. **PCMind-2.1-Kaiyuan-2B Technical Report**<br>
   ***Kairong Luo**, Zhenbo Sun, Xinyu Shi, Shengqi Chen, Bowen Yu, Yunyi Chen, Chenyi Dang, Hengtao Tao, Hui Wang, Fangming Liu, Kaifeng Lyu, Wenguang Chen*
   - **Technical Report** (December 2025)
   - **Derived submission**: [Quantile Benchmarking Heterogeneous Web Corpora in Open LLM Pretraining](https://openreview.net/forum?id=lwteHS4l8A), <span class="publication-card__badge publication-card__badge--spotlight">NeurIPS 2026 · Spotlight · Top 1.3%</span>
   - Links: [Technical Report](https://arxiv.org/abs/2512.07612), [Model](https://huggingface.co/thu-pacman/PCMind-2.1-Kaiyuan-2B), [Dataset](https://huggingface.co/datasets/thu-pacman/PCMind-2.1-Kaiyuan-2B), [Kaiyuan-Spark](https://github.com/thu-pacman/Kaiyuan-Spark), [kaiyuan-mindformers](https://github.com/thu-pacman/kaiyuan-mindformers/tree/kaiyuan)
   - **Summary**: This work presents a fully open 2B language model and releases the complete stack around it, including weights, dataset, preprocessing framework, and training framework. The report emphasizes efficient and effective pretraining under resource constraints.

5. **Larger Datasets Can Be Repeated More: A Theoretical Analysis of Multi-Epoch Scaling in Linear Regression**<br>
   *Tingkai Yan, Haodong Wen, Binghui Li, **Kairong Luo**, Wenguang Chen, Kaifeng Lyu*
   - **ICLR 2026**
   - **My contribution**: experimental part
   - Links: [OpenReview](https://openreview.net/forum?id=0CXjpAxHUE), [arXiv](https://arxiv.org/abs/2511.13421)

6. **A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules**<br>
   ***Kairong Luo**, Haodong Wen, Shengding Hu, Zhenbo Sun, Zhiyuan Liu, Maosong Sun, Kaifeng Lyu, Wenguang Chen*
   - **Accepted by ICLR 2025** (March 2025)
   - Links: [arXiv preprint](https://arxiv.org/abs/2503.12811)
   - **Summary**: This paper introduces an empirical law to predict the pretraining loss of large language models under various learning rate schedules (e.g., constant, cosine, step decay). The proposed multi-power law combines a power law based on the sum of learning rates with additional terms to account for loss reduction due to learning rate decay. Validated across multiple model sizes and architectures, this law accurately predicts loss curves for unseen schedules and helps identify optimal schedules that outperform widely used ones like cosine. The findings provide insights into pretraining dynamics and learning rate schedule design. The automatically discovered schedule resembles the Warmup-Stable-Decay (WSD) schedule but achieves slightly better performance.

7. **DreamFuser: Value-guided Diffusion Policy for Offline Reinforcement Learning**<br>
   ***Kairong Luo**, Caiwei Xiao, Zhiao Huang, Zhan Ling, Yunhao Fang, Hao Su*
   - **Preprint / Under Review** (November 2023)
   - Links: [OpenReview](https://openreview.net/forum?id=9jmUwjZi7j)
   - **Summary**: DreamFuser is a trajectory-based value optimization approach that integrates diffusion-based trajectory learning with efficient Q-function learning. It addresses computational challenges in action sampling during training by leveraging the Generalized Noisy Action Markov Decision Process (GNMDP), which treats the diffusion denoising process as part of the MDP transition. Empirical results show DreamFuser outperforms existing diffusion policy algorithms, particularly in low-level control tasks, and matches or exceeds state-of-the-art methods on the D4RL benchmark. The work also highlights the computational and memory advantages of DreamFuser over traditional MDP-based diffusion policies.

<!-- 
## Talks
1. **Invited Talk by [Kaifeng Lyu](https://kaifeng.ac/)**<br>
   - **Topic**: A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules  
   - **Date**: November 18, 2024  

2. **Invited Talk by [Yingfa Chen](https://chen-yingfa.github.io/)**<br>
   - **Topic**: A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules  
   - **Date**: March 13, 2025  
-->

## Teaching
- **Teaching Assistant**, *Probability and Statistics* (English), Tsinghua University, Autumn 2023. Course Code: 30470303-0. Instructor: [Yuhao Wang](https://yuhaow.github.io/).
- **Teaching Assistant**, *Introduction to Computing Systems* (Chinese, 计算机系统概论), Tsinghua University, Autumn 2024. Course Code: 30240593. Instructor: [Wentao Han](https://pacman.cs.tsinghua.edu.cn/~hanwentao/).
- **Teaching Assistant**, *Data Structure and Algorithm* (Chinese, 数据结构与算法), Tsinghua University, Spring 2025. Course Code: 20740112. Instructor: [Wentao Han](https://pacman.cs.tsinghua.edu.cn/~hanwentao/). Award: Second Prize, Outstanding Teaching Assistant, Tsinghua University.
- **Teaching Assistant**, *Large Language Models from Scratch: Theory and Practice* (从头训练大语言模型：理论与实践), Tsinghua University, Fall 2025. Course Code: 40470533-0. Instructor: [Kaifeng Lyu](https://kaifeng.ac/).

## Service and Leadership
- **Chair of IIIS Student Union (学生联席会)**, November 2023 - June 2024  
- **Mentor for Pre-college Program**, Department of Computer Science / IIIS, Tsinghua University, September 2024 - June 2025 (expected)  

---
