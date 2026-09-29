---
title: "A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules"
collection: publications
category: conferences
permalink: /publication/multi-power-law-loss-curve-prediction
excerpt: "A multi-power law that predicts loss curves across learning-rate schedules and helps identify schedules that outperform widely used defaults such as cosine decay."
date: 2025-03-17
venue: "ICLR 2025"
authors: "Kairong Luo, Haodong Wen, Shengding Hu, Zhenbo Sun, Zhiyuan Liu, Maosong Sun, Kaifeng Lyu, Wenguang Chen"
highlight: "Accepted by ICLR 2025"
summary: "We model loss across learning-rate schedules, predict unseen training trajectories, and use the fitted law to discover schedules that outperform cosine and WSD."
links:
  - label: "arXiv"
    url: "https://arxiv.org/abs/2503.12811"
paperurl: "https://arxiv.org/pdf/2503.12811"
citation: "Kairong Luo, Haodong Wen, Shengding Hu, Zhenbo Sun, Zhiyuan Liu, Maosong Sun, Kaifeng Lyu, and Wenguang Chen. (2025). &quot;A Multi-Power Law for Loss Curve Prediction Across Learning Rate Schedules.&quot; <i>ICLR 2025</i>."
header:
  teaser: research/mpl-optimized-schedules.png
featured: true
featured_order: 4
teaser_caption: "Predicted schedules, measured gains · Fig. 1"
teaser_alt: "Optimized learning-rate schedules and their measured loss curves compared with cosine and WSD."
focus: "Predicting & improving optimization"
---

- [arXiv](https://arxiv.org/abs/2503.12811)

This paper introduces an empirical law to predict the pretraining loss of large language models under various learning-rate schedules. The proposed multi-power law accurately predicts loss curves for unseen schedules and helps identify schedules that outperform commonly used ones such as cosine decay.
