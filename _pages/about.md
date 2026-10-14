---
layout: academic
permalink: /
title: "Kairong Luo · 罗开荣"
description: "Ph.D. student at Tsinghua University studying data, optimization, and efficient language-model pretraining."
redirect_from:
  - /about/
  - /about.html
---

<section class="hero" aria-labelledby="about-title">
  <div class="hero-intro">
    <h1 id="about-title">Kairong Luo <span lang="zh-Hans">罗开荣</span></h1>
    <p class="hero-role">Ph.D. student · Computer Science · Tsinghua University</p>
  </div>
  <figure class="hero-portrait">
    <img src="{{ '/images/profile-home.webp' | relative_url }}" width="480" height="600" alt="Portrait of Kairong Luo" fetchpriority="high">
  </figure>
  <div class="hero-bio">
    <p>I am advised by <a href="https://pacman.cs.tsinghua.edu.cn/~cwg/">Wenguang Chen</a> in the <a href="https://github.com/thu-pacman">PACMAN Lab</a>, and work closely with <a href="https://kaifeng.ac/">Kaifeng Lyu</a> and <a href="https://shengdinghu.github.io/">Shengding Hu</a>.</p>
    <p class="research-line">I study how <strong>data and optimization</strong> shape language model pretraining, and turn these insights into <strong>efficient, fully open training recipes</strong>.</p>
    <p>Previously, I received my B.Eng. from Tsinghua’s <a href="https://iiis.tsinghua.edu.cn/">Yao Class</a> in 2024.</p>
    <div class="profile-links" aria-label="Contact and academic profiles">
      <a href="mailto:{{ site.author.email }}">Email</a>
      <a href="{{ site.author.googlescholar }}">Google Scholar</a>
      <a href="https://github.com/{{ site.author.github }}">GitHub</a>
      <a href="https://x.com/{{ site.author.twitter }}">X</a>
      <a href="{{ '/cv/' | relative_url }}">CV</a>
    </div>
  </div>
</section>

<section id="blog" class="blog-section" aria-labelledby="blog-title">
  <div class="section-heading">
    <h2 id="blog-title">Blog</h2>
    <a href="{{ '/blog/' | relative_url }}">All posts <span aria-hidden="true">→</span></a>
  </div>
  {% assign recent_posts = site.posts | sort: 'date' | reverse %}
  {% for entry in recent_posts limit: 1 %}
    {% include blog-card.html post=entry %}
  {% endfor %}
</section>

<section id="research" class="research-section" aria-labelledby="selected-work">
  <div class="section-heading">
    <h2 id="selected-work">Selected research</h2>
    <a href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
  </div>
  {% assign featured_publications = site.publications | where: 'featured', true | sort: 'featured_order' %}
  {% for post in featured_publications %}
    {% include publication-card.html post=post %}
  {% endfor %}
</section>

<section id="honors" class="honors-section" aria-labelledby="honors-title">
  <div class="section-heading">
    <h2 id="honors-title">Selected honors</h2>
    <a href="{{ '/cv/#honors' | relative_url }}">Full CV <span aria-hidden="true">→</span></a>
  </div>
  {% assign selected_awards = site.data.cv.awards | where: 'selected', true | sort: 'selected_order' %}
  {% include honors-list.html awards=selected_awards %}
</section>
