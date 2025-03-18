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
- **Ph.D. in Department of Computer Science and Technology**, Tsinghua University, 2024-2029 (expected)
  - GPA: 4.0/4.0
- **B.S. in Institute for Interdisciplinary Information Sciences (IIIS)**, Tsinghua University, 2020-2024  
  - GPA: 3.95/4.0, Rank: 9/79

## Publications
1. **A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules**  
   *Kairong Luo, Haodong Wen, Shengding Hu, Zhenbo Sun, Zhiyuan Liu, Maosong Sun, Kaifeng Lyu, Wenguang Chen*  
   - **Accepted by ICLR 2025** (March 2025)  
   - [arXiv preprint](https://arxiv.org/abs/2503.12811)  
   - **Summary**: This paper introduces an empirical law to predict the pretraining loss of large language models under various learning rate schedules (e.g., constant, cosine, step decay). The proposed multi-power law combines a power law based on the sum of learning rates with additional terms to account for loss reduction due to learning rate decay. Validated across multiple model sizes and architectures, this law accurately predicts loss curves for unseen schedules and helps identify optimal schedules that outperform widely used ones like cosine. The findings provide insights into pretraining dynamics and learning rate schedule design. The automatically discovered schedule resembles the Warmup-Stable-Decay (WSD) schedule but achieves slightly better performance.

2. **DreamFuser: Value-guided Diffusion Policy for Offline Reinforcement Learning**  
   - **Status**: Preprint / Under Review (November 2023)  
   - [OpenReview](https://openreview.net/forum?id=9jmUwjZi7j)  
   - **Summary**: DreamFuser is a trajectory-based value optimization approach that integrates diffusion-based trajectory learning with efficient Q-function learning. It addresses computational challenges in action sampling during training by leveraging the Generalized Noisy Action Markov Decision Process (GNMDP), which treats the diffusion denoising process as part of the MDP transition. Empirical results show DreamFuser outperforms existing diffusion policy algorithms, particularly in low-level control tasks, and matches or exceeds state-of-the-art methods on the D4RL benchmark. The work also highlights the computational and memory advantages of DreamFuser over traditional MDP-based diffusion policies.

<!-- 
## Talks
1. **Invited Talk by [Kaifeng Lyu](https://kaifeng.ac/)**  
   - **Topic**: A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules  
   - **Date**: November 18, 2024  

2. **Invited Talk by [Yingfa Chen](https://chen-yingfa.github.io/)**  
   - **Topic**: A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules  
   - **Date**: March 13, 2025  
-->

## Teaching
- **Teaching Assistant**, *Probability and Statistics* (English), Tsinghua University, Autumn 2023  
  - Course Code: 30470303-0
  - Instructor: [Yuhao Wang](https://yuhaow.github.io/)

- **Teaching Assistant**, *Introduction to Computing Systems* (Chinese, 计算机系统概论), Tsinghua University, Autumn 2024  
  - Instructor: [Wentao Han](https://pacman.cs.tsinghua.edu.cn/~hanwentao/)  

- **Teaching Assistant**, *Data Structure and Algorithm* (Chinese, 数据结构与算法), Tsinghua University, Spring 2024  
  - Instructor: [Wentao Han](https://pacman.cs.tsinghua.edu.cn/~hanwentao/)  

## Service and Leadership
- **Chair of IIIS Student Union (学生联席会)**, November 2023 - June 2024  
- **Mentor for Pre-college Program**, Department of Computer Science / IIIS, Tsinghua University, September 2024 - June 2025 (expected)  

---
