---
layout: archive
permalink: /
title: "About Me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% include base_path %}

I am a third-year Ph.D. student in the Department of Computer Science and Technology at Tsinghua University, fortunate to be advised by [Prof. Wenguang Chen](https://pacman.cs.tsinghua.edu.cn/~cwg/) in the [PACMAN Lab](https://github.com/thu-pacman). My current research interests and effort include **scaling of language models**, **efficient training**, **open-source pretraining**, and understanding how data curricula and optimization interact during pretraining. I am fortunate to collaborate with [Kaifeng Lyu](https://kaifeng.ac/) and [Shengding Hu](https://shengdinghu.github.io/).

I received my **B.Eng. in Computer Science and Technology** in 2024 from Tsinghua University, where I was a member of the **Yao Class**, headed by Prof. Andrew Chi-Chih Yao. During my undergraduate study, I was fortunately advised by [Li Yi](https://ericyi.github.io/), [Hao Su](https://cseweb.ucsd.edu/~haosu/), and [Wenguang Chen](https://pacman.cs.tsinghua.edu.cn/~cwg/).

<div class="research-statement" markdown="1">
**Making pretraining more efficient—and understanding why it works.**

My work connects scaling laws, data quality, and optimization dynamics. I use controlled experiments to understand how training choices interact, then translate those insights into better schedules and fully open pretraining recipes.
</div>

<div class="selected-heading">
  <h2 id="selected-work">Selected Work</h2>
  <a href="/publications/">All publications <span aria-hidden="true">→</span></a>
</div>
<p class="selected-intro">From predictive laws and training mechanisms to reproducible models.</p>
{% assign featured_publications = site.publications | where: "featured", true | sort: "featured_order" %}
<div class="publication-card-list publication-card-list--home">
  {% for post in featured_publications %}
    {% include publication-card.html post=post %}
  {% endfor %}
</div>
