---
title: "Open LLM Pretraining Guided by Quantile Benchmarking Heterogeneous Web Corpora"
collection: publications
category: conferences
permalink: /publication/quantile-benchmarking
year: 2026
venue: "NeurIPS 2026"
authors: "Kairong Luo, Zhenbo Sun, Xinyu Shi, Shengqi Chen, Bowen Yu, Yunyi Chen, Chenyi Dang, Hengtao Tao, Hui Wang, Fangming Liu, Kaifeng Lyu, Wenguang Chen"
co_first_authors:
  - Kairong Luo
  - Zhenbo Sun
highlight: "NeurIPS 2026 Spotlight"
distinction: "Spotlight"
topic: "Data quality"
excerpt: "Quantile benchmarking compares heterogeneous web corpora and guides data mixtures for open LLM pretraining."
summary: "Comparing web corpora across quality quantiles helps choose better data mixtures for open LLM pretraining."
related_label: "derived from Kaiyuan-2B"
related_url: "/publication/pcmind-kaiyuan-2b-technical-report"
links:
  - label: "Paper"
    url: "https://openreview.net/forum?id=lwteHS4l8A"
  - label: "Model"
    url: "https://huggingface.co/thu-pacman/PCMind-2.1-Kaiyuan-2B"
  - label: "Data"
    url: "https://huggingface.co/datasets/thu-pacman/PCMind-2.1-Kaiyuan-2B"
  - label: "Code"
    url: "https://github.com/thu-pacman/Kaiyuan-Spark"
paperurl: "https://openreview.net/forum?id=lwteHS4l8A"
header:
  teaser: research/kaiyuan-2b-performance.svg
teaser_caption: "Open pretraining · Kaiyuan-2B"
teaser_alt: "Evaluation of the related Kaiyuan-2B model, whose data recipe uses quantile benchmarking."
featured: true
featured_order: 2
contribution: "Co-first author, listed first."
citation: "Kairong Luo, Zhenbo Sun, Xinyu Shi, Shengqi Chen, Bowen Yu, Yunyi Chen, Chenyi Dang, Hengtao Tao, Hui Wang, Fangming Liu, Kaifeng Lyu, and Wenguang Chen. (2026). &quot;Open LLM Pretraining Guided by Quantile Benchmarking Heterogeneous Web Corpora.&quot; NeurIPS 2026 Spotlight."
---

**NeurIPS 2026 Spotlight.** Previously titled *Quantile Benchmarking Heterogeneous Web Corpora in Open LLM Pretraining*.

Web corpora contain a wide range of data quality, making corpus-level comparisons difficult to interpret. Quantile benchmarking compares their training effectiveness across quality levels and uses the results to guide data selection and mixing.

I am a co-first author, listed first. This paper is related to the [PCMind-2.1-Kaiyuan-2B project]({{ '/publication/pcmind-kaiyuan-2b-technical-report' | relative_url }}), which releases the model, data, and pretraining code. The figure above is the model evaluation from that project's technical report.
