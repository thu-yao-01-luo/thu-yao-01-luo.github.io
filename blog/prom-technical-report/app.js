(() => {
  'use strict';

  const data = window.PURO_DATA;
  const models = data.research.models;
  const modelMap = new Map(models.map(model => [model.id, model]));
  const ablations = data.ablation.records;
  const ablationMap = new Map(ablations.map(record => [record.id, record]));
  const state = { language: 'zh', section: 'intro', model: null, ablation: null };
  const dialog = document.getElementById('model-dialog');
  const ablationDialog = document.getElementById('ablation-dialog');
  const figureDialog = document.getElementById('figure-dialog');
  const figureViewport = document.getElementById('figure-viewport');
  const figureImage = document.getElementById('figure-viewer-image');
  const tooltip = document.getElementById('chart-tooltip');
  const tocPanel = document.getElementById('toc-panel');
  const tocToggle = document.querySelector('.toc-toggle');
  const referenceMap = new Map(data.references.map(reference => [reference.id, reference]));
  const referenceNotes = [...document.querySelectorAll('[data-reference]')];
  const citationLinks = [...document.querySelectorAll('[data-citation]')];
  const scrim = document.querySelector('.toc-scrim');
  const narrowLayout = window.matchMedia('(max-width: 1150px)');
  let returnFocus = null;
  let ablationReturnFocus = null;
  let tooltipAnchor = null;
  let tooltipDismissTimer = null;
  let figureState = null;
  let figureReturnFocus = null;
  let figureDrag = null;
  let tocOpen = false;
  let activeCitation = null;

  const ui = {
    skip: ['跳到正文', 'Skip to article'],
    tocToggle: ['目录', 'Contents'], contents: ['章节目录', 'Contents'], intro: ['开篇', 'Introduction'],
    references: ['参考文献', 'Reference'],
    paperFigure: ['论文原图 ↗', 'Paper figure ↗'],
    paperLeft: ['左图原图 ↗', 'Left original ↗'], paperRight: ['右图原图 ↗', 'Right original ↗'],
    backToFigure: ['返回图', 'Back to Figure'], paperSources: ['论文：', 'Paper:'],
    expandFigure: ['放大查看', 'Enlarge figure'],
    zoomIn: ['+ 放大', '+ Zoom in'], zoomOut: ['− 缩小', '− Zoom out'],
    fitFigure: ['适应窗口', 'Fit to window'],
    figurePanHint: ['拖动或滑动查看细节。', 'Drag or swipe to inspect details.'],
    swipeModels: ['↔ 左右滑动查看全部 15 个模型', '↔ Scroll horizontally to see all 15 models'],
    swipeFactors: ['↔ 左右滑动查看完整图表', '↔ Scroll horizontally to see the full chart'],
    switchModel: ['切换模型', 'Switch model'], switchAblation: ['切换配置', 'Switch configuration'],
    costScope: ['上述统计，只计正式预训练 GPU 成本，不代表项目总成本。', 'The figures above cover only GPU compute for formal pretraining runs, not total project costs.'],
    chooseModel: ['模型', 'Model'],
    chooseModelPlaceholder: ['选择模型', 'Choose a model'],
    chooseAblation: ['实验配置', 'Training setup'],
    chooseAblationPlaceholder: ['选择配置', 'Choose a configuration'],
    scalingGuide: ['UD、CD 与 CMA 见 ', 'For UD, CD, and CMA, see '],
    cmaSection: ['第4节（CMA）', 'Section 4 (CMA)'],
    udFinalFigure: [`UD final（图 ${data.figureLabels['cma-results'].number}）`, `UD final (Figure ${data.figureLabels['cma-results'].number})`],
    cmaSetupTitle: ['训练过程示意', 'Training setup schematic'],
    cmaSetupSwipe: ['↔ 左右滑动查看完整示意图', '↔ Scroll sideways to view the full schematic'],
    cmaSetupNote: ['色条示意各数据源内部的相对质量。标有步数的是实际检查点，其余以 θ₁…θₙ 表示。', 'Colors illustrate relative quality within each source. Recorded checkpoints have step labels. Other averaging windows use θ₁…θₙ.'],
    ablationKey: ['UD：随机数据顺序＋学习率衰减。\nCD：课程顺序＋学习率衰减。\nCDC：CD 后接恒定学习率续训。\nCMA：平均续训末端的检查点参数。\n215k/218k 指从第 215,000/218,000 步恢复，final/avg 分别表示末个检查点/检查点参数平均。', 'UD: shuffled data with LR decay.\nCD: curriculum order with LR decay.\nCDC: CD followed by constant-LR continuation.\nCMA: parameter averaging over late continuation checkpoints.\n215k/218k: resume at step 215,000/218,000. Final/avg: final checkpoint/checkpoint parameter average.'],
    ablationRecord: [`图 ${data.figureLabels['cma-results'].number} · 实验训练配置`, `Figure ${data.figureLabels['cma-results'].number} · Training configuration`],
    ablationOrigin: ['各组从同一个第一阶段 checkpoint 出发，使用同一份第二阶段数据。图中 step 为全局优化器步数。', 'All configurations start from the same Phase 1 checkpoint and use the same Phase 2 data pool. Step numbers are global optimizer steps.'],
    ablationSource: ['续训与模型平均配置（附录 H.3）↗', 'Continuation and checkpoint averaging (Appendix H.3) ↗'],
    openAblation: ['查看训练与 checkpoint 配置', 'View training and checkpoint details'],
    dataOrder: ['数据排布', 'Data order'], learningRate: ['学习率与续训', 'Learning rate and continuation'],
    checkpointSelection: ['使用的 checkpoint', 'Selected checkpoints'], modelAveraging: ['模型平均', 'Model averaging'],
    table7: ['完整成本对照（Table 7）', 'Full cost comparison (Table 7)'],
    record: ['模型成本与评测记录', 'Model cost and evaluation record'],
    accounting: ['价格与汇率固定采用报告 Table 6，1 USD = 6.8067 CNY，非当前实时汇率。上述统计，只计正式预训练 GPU 成本，不代表项目总成本。', 'Prices and exchange rates are fixed to Table 6: 1 USD = 6.8067 CNY, not a live exchange rate. The figures above cover only GPU compute for formal pretraining runs, not total project costs.'],
    modelName: ['模型名称', 'Model'], type: ['开放类型', 'Release type'],
    originalLink: ['原文链接', 'Original source'], method: ['估算 / 测量方法', 'Estimation / measurement method'],
    price: ['价格基准', 'Price basis'], hours: ['GPU 卡时', 'GPU-hours'],
    usd: ['美元成本', 'Cost in USD'], rmb: ['人民币成本估计', 'Estimated cost in CNY'],
    average: ['平均性能', 'Average performance'],
    openWeight: ['开源权重', 'Open weights'], fullyOpen: ['全流程开源（模型+数据集）', 'End-to-end open (model + data)'],
    reported: ['报告算力 / 时间', 'Reported compute / time'], estimated: ['估算算力', 'Estimated compute'],
    finalPuro: ['Puro 训练结果', 'Puro training results'], frontier: ['其他模型 Pareto 前沿', 'Other-model Pareto frontier'],
    costAxis: ['复现成本（美元，对数刻度）', 'Reproduction cost (USD, log scale)'],
    scoreAxis: ['15 项任务平均分（%）', 'Average score over 15 tasks (%)'],
    openDetails: ['点击查看成本与 15 项评分', 'Click for cost details and 15 benchmark scores'],
    tooltipAverage: ['15 项平均分', 'Average · 15 tasks'],
    tooltipCost: ['复现成本 · USD', 'Cost · USD'],
    tooltipModelHint: ['点击模型查看成本与 15 项评分', 'Click marker for costs & 15 scores'],
    costChart: ['模型性能与复现成本。所有方块、圆圈和星形均可点击', 'Model performance versus reproduction cost. Every square, circle, and star is interactive'],
    efficiencyChart: ['各环节效率收益。点击柱子跳至实验依据', 'Component efficiency gains. Select a bar to jump to its evidence'],
    multiplierAxis: ['相对成本效率（×）', 'Relative cost efficiency (×)'],
    hardware: ['硬件', 'Hardware'], precision: ['分块 FP8', 'Blockwise FP8'], optimizer: ['MuonH', 'MuonH'], joint_phase2_recipe: ['阶段 2 / CMA', 'Phase 2 / CMA'],
    evidence: ['效率收益与实验依据', 'Efficiency gains and supporting experiments'],
    checkpointRecord: ['这组实验使用随机排布的数据（UD）。不同训练预算下的结果见', 'This run uses uniformly shuffled data (UD). For results at different training budgets, see'],
    checkpointFigure: [`图 ${data.figureLabels['cost-scaling'].number}`, `Figure ${data.figureLabels['cost-scaling'].number}`],
    benchmark: ['Benchmark', 'Benchmark'], score: ['分数（%）', 'Score (%)'],
    technicalSource: ['技术报告 / 官方模型资料 ↗', 'Technical report / official model source ↗'],
    close: ['关闭', 'Close'],
    recordSource: ['论文表格 ↗', 'Paper tables ↗'],
    '6ND, model tokens': ['6ND，单模型 token 数', '6ND, model tokens'],
    '6ND, family tokens': ['6ND，模型系列 token 数', '6ND, family tokens'],
    'Reported GPU-hours': ['原文报告 GPU 卡时', 'Reported GPU-hours'],
    'Reported count/time': ['原文报告卡数与时间', 'Reported count/time'],
    '6ND, reported MFU': ['6ND，使用报告的 MFU', '6ND, using the reported MFU'],
    'Measured GPU-hours': ['实测 GPU 卡时', 'Measured GPU-hours'],
    'H100 equivalent': ['H100 等效估算', 'H100 equivalent'],
    'A100-80GB rate': ['A100 80GB 等效估算', 'A100 80GB equivalent estimate'],
    description: ['Puro-2B 的低成本预训练实践：在 RTX 5090 上训练约 20 亿参数的模型，介绍硬件、FP8、优化器和数据配方，以及复现实验所需的开源材料。', 'Pretraining Puro-2B on RTX 5090 GPUs: hardware, FP8 training, optimizer and data recipes, with open materials for reproducing the experiments.'],
  };
  const methodDescriptions = {
    '6ND, model tokens': ['使用 C = 6ND，以对应模型的训练 token 数估算。', 'C = 6ND, using the model-specific training-token count.'],
    '6ND, family tokens': ['使用 C = 6ND，以模型系列使用的训练 token 数估算。', 'C = 6ND, using the number of training tokens reported for the model family.'],
    'Reported GPU-hours': ['原文直接报告 GPU-hours，再按 Table 6 单价换算。', 'GPU-hours reported directly by the source, priced using Table 6.'],
    'Reported count/time': ['原文报告 GPU 数量及训练时间，卡时 = 卡数 × 小时数。', 'Reported GPU count and training duration. GPU-hours = GPU count × hours.'],
    '6ND, reported MFU': ['使用 C = 6ND，并采用报告的 MFU 51.57% 与 A800 BF16 峰值 312 TFLOP/s。', 'C = 6ND with the reported 51.57% MFU and A800 BF16 peak of 312 TFLOP/s.'],
    'Measured GPU-hours': ['按实际训练时间和使用的 GPU 数量计算 GPU 卡时。', 'GPU-hours are calculated from the actual training time and the number of GPUs used.'],
  };
  const trainingNotesZh = {
    'Qwen2-1.5B': 'N = 1.54B，D = 7T（模型 token）。',
    'Qwen2.5-1.5B': 'N = 1.54B，D = 18T（模型系列使用的训练 token 数）。',
    'Qwen3-1.7B-Base': 'N = 1.70B，D = 36T，仅计预训练。',
    'Gemma-2-2B': 'N = 2.61B，D = 2T。', 'Gemma-3-1B-PT': 'N = 1.00B，D = 2T。',
    'Llama-3.2-3B': '报告 460,000 H100 GPU-hours，不包含另行报告的系列共享 logit 生成开销。',
    'LFM2.5-1.2B-Base': 'N = 1.17B，D = 28T（模型系列使用的训练 token 数）。',
    'Falcon-H1-Deep-1.5B-Base': 'N = 1.55B，D = 3T（模型系列所用的 token 量）。报告披露，使用 H100 集群训练。',
    'Instella-3B': 'N = 3.11B，D = 4.122575T（4.065T + 57.575B）。',
    'OLMoE-1B-7B-0125': '256 张 H100 × 约 10 天 × 24 小时 = 61,440 GPU-hours，时间为约数。',
    'Yulan-Mini-2.4B': 'N = 2.42B，D = 1.08T。\nGPU-hours 使用报告的 MFU 换算，A800 成本按 A100 80GB 单价等效估算。',
    'SmolLM3-3B-Base': '384 张 H100 × 24 天 × 24 小时 = 221,184 GPU-hours。',
    'MobileLLM-R1-950M-base': '官方训练表列出 128 张 GPU，两个 4–5 天的预训练阶段和两个 1–2 天的中期训练阶段，共 30,720–43,008 卡时，按中点 36,864 卡时计。训练表未注明 GPU 型号，成本按 A100 80GB 单价折算。',
    'Puro-2B': 'Phase 1：6,009.46 卡时。\nPhase 2：16,504.95 卡时。\n合计 22,514.41 卡时，不计排队、停机等未进行训练的时间。',
    'Puro-2B (UD; $4.4K)': '第一阶段使用 24 张 GPU，第二阶段使用 96 张 GPU。合计约 14,262 卡时、4,365 美元，图中标作 $4.4K。平均分为 55.54%。',
  };
  const trainingNotesEn = {
    'Qwen2-1.5B': 'N = 1.54B, D = 7T (model-specific tokens).',
    'Qwen2.5-1.5B': 'N = 1.54B, D = 18T (training tokens used by the model family).',
    'Qwen3-1.7B-Base': 'N = 1.70B, D = 36T, counting pretraining only.',
    'Gemma-2-2B': 'N = 2.61B, D = 2T.',
    'Gemma-3-1B-PT': 'N = 1.00B, D = 2T.',
    'Llama-3.2-3B': 'The report lists 460,000 H100 GPU-hours, excluding the separately reported shared family logit-generation cost.',
    'LFM2.5-1.2B-Base': 'N = 1.17B, D = 28T (training tokens used by the model family).',
    'Falcon-H1-Deep-1.5B-Base': 'N = 1.55B, D = 3T (tokens used by the model family). The report states that training used an H100 cluster.',
    'Instella-3B': 'N = 3.11B, D = 4.122575T (4.065T + 57.575B).',
    'OLMoE-1B-7B-0125': '256 H100 GPUs × approximately 10 days × 24 hours = 61,440 GPU-hours. The duration is approximate.',
    'SmolLM3-3B-Base': '384 H100 GPUs × 24 days × 24 hours = 221,184 GPU-hours.',
    'Puro-2B': 'Phase 1: 6,009.46 GPU-hours.\nPhase 2: 16,504.95 GPU-hours.\nTotal: 22,514.41 GPU-hours, excluding queueing, downtime, and other time not spent training.',
    'Puro-2B (UD; $4.4K)': 'This run uses 24 GPUs in Phase 1 and 96 in Phase 2, totaling about 14,262 GPU-hours and $4,365, shown as $4.4K in the plot. The average score is 55.54%.',
    'Yulan-Mini-2.4B': 'N = 2.42B, D = 1.08T. GPU-hours are derived using the reported MFU. A800 costs are estimated at the A100 80GB rate.',
    'MobileLLM-R1-950M-base': 'The official training table lists 128 GPUs, two pretraining stages of 4–5 days each, and two mid-training stages of 1–2 days each: 30,720–43,008 GPU-hours, using the midpoint of 36,864. The table does not name the GPU model. Costs use the A100 80GB rate.',
  };
  const evidenceDescriptions = {
    hardware: {
      comparison: ['H200 BF16 → RTX 5090 BF16', 'H200 BF16 → RTX 5090 BF16'],
      paragraphs: [
        [
          '我们想比较的是：同样一笔预算，用哪款 GPU 能买到更多 BF16 计算量？这既取决于 GPU 每秒能做多少计算，也取决于这笔钱能让它运行多久。H200 的 BF16 峰值算力为 989.5 TFLOP/s，每卡时 4 美元。RTX 5090 为 209.5 TFLOP/s，每卡时约 0.3061 美元。RTX 5090 的价格由我们的硬件和电费成本折算而来：一个 8 卡节点每月约 12,000 元。',
          '以 1 美元为例，H200 可以运行 1/4 小时，即 0.25 小时，而 RTX 5090 可以运行 1/0.3061 ≈ 3.27 小时。把各自的运行时间乘以峰值算力，再比较两者，得到 (209.5 ÷ 0.3061) ÷ (989.5 ÷ 4) ≈ 2.77。也就是说，虽然 RTX 5090 的单卡峰值算力更低，但价格降得更多，因此相同预算能购买约 2.77 倍的 BF16 峰值计算量。',
        ],
        [
          'Which GPU buys more BF16 compute for the same budget? The answer depends on both its compute throughput and how long the budget lets it run. The H200 provides 989.5 TFLOP/s of peak BF16 throughput at $4 per GPU-hour. The RTX 5090 provides 209.5 TFLOP/s at about $0.3061 per GPU-hour. The RTX 5090 rate comes from our hardware and electricity costs, about CNY 12,000 per month for an eight-GPU node.',
          'For $1, the H200 can run for 1/4 = 0.25 hours, while the RTX 5090 can run for 1/0.3061 ≈ 3.27 hours. Multiplying each runtime by its peak throughput and taking the ratio gives (209.5 ÷ 0.3061) ÷ (989.5 ÷ 4) ≈ 2.77. The RTX 5090 has lower peak throughput per GPU, but its price is lower by an even larger factor. The same budget therefore buys about 2.77 times as much peak BF16 compute.',
        ],
      ],
      figure: 'hardware-cost',
      sources: [
        { label: ['Table 2', 'Table 2'], page: 9 },
        { label: ['Table 6', 'Table 6'], page: 38 },
        { label: ['§3.1', '§3.1'], page: 8 },
      ],
    },
    precision: {
      comparison: ['MuonH BF16 → MuonH 分块 FP8', 'MuonH BF16 → MuonH blockwise FP8'],
      paragraphs: [
        [
          'FP8 跑得更快，但数值精度更低。要判断它最终节省多少训练时间，我们需要把两件事一起考虑：每秒能处理多少 token，以及达到同样验证损失需要多少训练算力。',
          '我们先在五个模型规模上比较 BF16 与分块 FP8。相较 BF16，FP8 的验证损失值高出约 0.003–0.004。根据损失与计算量的拟合曲线，把这部分差距折算到达到同样损失所需的计算量，我们发现，FP8 还是保留约 98% 的计算效率。',
          '再看运行速度：在 1.7B 模型上，FP8 的实测吞吐量约为 BF16 的 1.36 倍。将吞吐收益与上面的效率系数结合，得到约 1.34 倍的净收益。因此，达到相同验证损失时，预计可节省约 25.2% 的 GPU 卡时。',
        ],
        [
          'FP8 runs faster but uses lower numerical precision. To estimate how much training time it saves, we consider both the number of tokens processed per second and the training compute needed to reach the same validation loss.',
          'We first compare BF16 and blockwise FP8 at five model sizes. FP8 validation loss is about 0.003–0.004 higher than BF16. Using the fitted loss–compute curves, we translate this gap into the extra compute needed to match the loss and find that FP8 still retains about 98% of the compute efficiency.',
          'We then account for runtime throughput. On the 1.7B model, measured FP8 throughput is about 1.36 times that of BF16. Combining this speed gain with the compute-efficiency factor gives a net gain of about 1.34 times, corresponding to an estimated 25.2% reduction in GPU-hours at the same validation loss.',
        ],
      ],
      figure: 'fp8-results',
      sources: [
        { label: ['Figure 10b', 'Figure 10b'], page: 23 },
        { label: ['§4.3.1', '§4.3.1'], page: 22 },
      ],
    },
    optimizer: {
      comparison: ['调参后 Muon → MuonH（均为分块 FP8）', 'Tuned Muon → MuonH (both blockwise FP8)'],
      paragraphs: [
        [
          '这里要回答的是：达到同样的验证损失，MuonH 能比 Muon 少用多少计算量？我们在相同的一组模型规模上训练两种优化器，都使用分块 FP8，并对 Muon 基线进行调参。随后，根据实验点拟合两条损失—计算量曲线。',
          '在同一个验证损失处，分别读取两条曲线对应的 FLOPs。Muon 所需计算量约为 MuonH 的 1.19 倍。换一种说法，如果 Muon 需要 100 份计算量，MuonH 大约需要 84 份，节省约 16.1%。',
        ],
        [
          'How much less compute does MuonH need than Muon to reach the same validation loss? We train both optimizers at the same set of model sizes, use blockwise FP8 for both, and tune the Muon baseline. We then fit a loss–compute curve to each set of results.',
          'At a given validation loss, we read off the FLOPs required by each curve. Muon needs about 1.19 times as much compute as MuonH. In other words, if Muon needs 100 units of compute, MuonH needs about 84, saving roughly 16.1%.',
        ],
      ],
      figure: 'muonh-results',
      sources: [
        { label: ['Figure 10a', 'Figure 10a'], page: 23 },
        { label: ['§4.3.1', '§4.3.1'], page: 22 },
      ],
    },
    joint_phase2_recipe: {
      comparison: ['随机数据排布（UD）→ 完整 CMA 配方', 'Uniform Data (UD) → complete CMA recipe'],
      paragraphs: [
        [
          '完整 CMA 模型在 15 项基准上的平均分为 57.81，预训练计算成本约为 6,900 美元。若改用随机数据排布（UD），达到这个分数需要多少成本？',
          '我们从同一个第一阶段 checkpoint 出发，以不同预算完成 UD 的第二阶段训练，并用这些结果拟合 Puro Cost Scaling Law。沿拟合曲线外推至平均分 57.81，UD 对应的成本约为 16,600 美元。因此，在相同分数下，两者的成本比约为 16,600 ÷ 6,900 ≈ 2.40，CMA 所需成本约为 UD 估计成本的 42%。',
          `这组 CMA 实验先按课程顺序配合线性学习率衰减训练，再恢复第 218,000 步的 checkpoint，以该步学习率恒定续训，最后平均续训末端六个 checkpoint 的参数。图 ${data.figureLabels['cma-results'].number} 对比了随机排布、课程排布、恒定学习率续训和参数平均的不同组合。点击柱子，可以查看各组的续训起点与平均范围。`,
        ],
        [
          'The complete CMA model averages 57.81 across 15 benchmarks at a pretraining compute cost of about $6,900. What would it cost to reach that score with Uniform Data (UD)?',
          'Starting from the same Phase 1 checkpoint, we train UD with several Phase 2 budgets and fit the Puro Cost Scaling Law to the results. Extrapolating the fitted curve to 57.81 gives an estimated UD cost of about $16,600. At the same score, the cost ratio is therefore $16,600 ÷ $6,900 ≈ 2.40. CMA costs about 42% of the UD estimate.',
          `This CMA run first uses curriculum ordering with linear LR decay, then resumes checkpoint 218,000 at a constant LR equal to its value at that step. The final model averages parameters from the last six continuation checkpoints. Figure ${data.figureLabels['cma-results'].number} compares combinations of shuffled or curriculum data, constant-LR continuation, and parameter averaging. Select a bar to inspect the continuation start and the checkpoints averaged.`,
        ],
      ],
      figure: 'cma-results',
      sources: [
        { label: ['Figure 2b', 'Figure 2b'], page: 5 },
        { label: ['Figure 13b', 'Figure 13b'], page: 42 },
        { label: ['附录 H.3', 'Appendix H.3'], page: 56 },
      ],
    },
  };

  function text(key, language = state.language) { return ui[key]?.[language === 'en' ? 1 : 0] || key; }
  function localized(pair, language = state.language) { return pair[language === 'en' ? 1 : 0]; }
  function escaped(value) { return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
  function numeric(value, digits = 0) { return Number(value).toLocaleString(state.language === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
  function modelType(model) { return text(model.type === 'open_weight' ? 'openWeight' : 'fullyOpen'); }
  function modelLabel(model) { return model.id === 'puro-44' ? 'Puro-2B (UD, $4.4K)' : model.name; }

  function tooltipTarget(target) {
    return target?.closest?.('.model-mark') || target?.closest?.('[data-ablation]');
  }

  function hideTooltip() {
    clearTimeout(tooltipDismissTimer);
    tooltipDismissTimer = null;
    tooltip.hidden = true;
    tooltipAnchor?.removeAttribute('aria-describedby');
    tooltipAnchor = null;
  }

  function scheduleTooltipHide() {
    if (document.activeElement === tooltipAnchor) return;
    clearTimeout(tooltipDismissTimer);
    tooltipDismissTimer = setTimeout(hideTooltip, 120);
  }

  function showTooltip(trigger) {
    if (dialog.open || ablationDialog.open || figureDialog.open) return;
    clearTimeout(tooltipDismissTimer);
    if (tooltipAnchor === trigger && !tooltip.hidden) return;
    const model = modelMap.get(trigger.dataset.model);
    const ablation = ablationMap.get(trigger.dataset.ablation);
    if (!model && !ablation) return;
    hideTooltip();
    tooltipAnchor = trigger;
    const fields = [[text('tooltipAverage'), `${numeric(model?.average ?? ablation.score, 2)}<span class="chart-tooltip-unit">%</span>`]];
    if (model) fields.push([text('tooltipCost'), `$${numeric(model.usd)}`]);
    tooltip.innerHTML = `<p class="chart-tooltip-name">${escaped((model || ablation).name)}</p><dl class="chart-tooltip-stats">${fields.map(([label, value]) => `<div><dt>${escaped(label)}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="chart-tooltip-hint">${text(model ? 'tooltipModelHint' : 'openAblation')}</p>`;
    tooltip.hidden = false;
    tooltip.style.left = '12px';
    tooltip.style.top = '12px';
    const bounds = trigger.getBoundingClientRect();
    const markerBounds = trigger.querySelector('.hit-area')?.getBoundingClientRect() || bounds;
    const size = tooltip.getBoundingClientRect();
    const left = (markerBounds.left + markerBounds.right - size.width) / 2;
    const above = bounds.top - size.height - 12;
    const top = above >= 12 ? above : bounds.bottom + 12;
    tooltip.style.left = `${Math.max(12, Math.min(left, window.innerWidth - size.width - 12))}px`;
    tooltip.style.top = `${Math.max(12, Math.min(top, window.innerHeight - size.height - 12))}px`;
    trigger.setAttribute('aria-describedby', tooltip.id);
  }

  function priceBasis(model) {
    if (model.price === 'RTX 5090') return localized(['RTX 5090：12,000 元 / 8 卡节点月 ÷ (8 × 30 × 24) = 2.0833 元/卡时，约 $0.3061/卡时。', 'RTX 5090: CNY 12,000 per 8-GPU node-month ÷ (8 × 30 × 24) = CNY 2.0833/GPU-hour, about $0.3061/GPU-hour.']);
    if (model.price === 'A100-80GB rate') return localized(['按 A100 80GB 单价折算：$1.79/卡时（约 12.184 元/卡时）。', 'Costed at the A100 80GB rate: $1.79/GPU-hour (about CNY 12.184/GPU-hour).']);
    return localized(['H100：$3.25/卡时（22.121775 元/卡时）。', 'H100: $3.25/GPU-hour (CNY 22.121775/GPU-hour).']) + (model.price.includes('equivalent') ? localized(['\n等效估算：BF16 989.5 TFLOP/s，MFU = 70%。', '\nEquivalent estimate: BF16 989.5 TFLOP/s, MFU = 70%.']) : '');
  }

  function renderModel(model) {
    document.getElementById('model-name').textContent = modelLabel(model);
    const context = model.table7 ? '' : `${escaped(text('checkpointRecord'))} <a href="#figure-cost-scaling" data-article-jump>${text('checkpointFigure')}</a>${state.language === 'zh' ? '。' : '.'} `;
    document.getElementById('model-provenance').innerHTML = `${context}<a href="https://arxiv.org/pdf/2608.27370v2#page=${model.table7 ? 39 : 53}" target="_blank" rel="noopener noreferrer">${text('recordSource')}</a>`;
    const method = localized(methodDescriptions[model.evidence]);
    const notes = state.language === 'zh' ? trainingNotesZh[model.name] : trainingNotesEn[model.name] || `${model.trainingScale}. ${model.notes}`;
    const fields = [
      ['modelName', escaped(modelLabel(model))], ['type', escaped(modelType(model))],
      ['originalLink', `<a href="${escaped(model.source)}" target="_blank" rel="noopener noreferrer">${text('technicalSource')}</a>`],
      ['method', `${escaped(method)}<small>${escaped(notes)}</small>`], ['price', priceBasis(model).split('\n').map(escaped).join('<br>')],
      ['hours', numeric(model.gpuHours)], ['usd', `$${numeric(model.usd)}`], ['rmb', `¥${numeric(model.rmb)}`], ['average', `${numeric(model.average, 2)}%`],
    ];
    document.getElementById('model-fields').innerHTML = `<dl class="model-fields">${fields.map(([key, value]) => `<div><dt>${text(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
    document.getElementById('benchmark-table').innerHTML = `<table class="benchmark-table"><thead><tr><th scope="col">${text('benchmark')}</th><th scope="col">${text('score')}</th></tr></thead><tbody>${data.research.benchmarks.map((benchmark, index) => `<tr><th scope="row">${benchmark.label}</th><td>${numeric(model.scores[index], 2)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">AVG</th><td>${numeric(model.average, 2)}</td></tr></tfoot></table>`;
    document.getElementById('model-dialog-select').value = model.id;
    document.getElementById('model-select').value = model.id;
    document.querySelectorAll('[data-model]').forEach(marker => marker.classList.toggle('selected', marker.dataset.model === model.id));
  }

  function renderAblationControls() {
    const options = ablations.map(record => `<option value="${record.id}">${escaped(record.name)} · ${record.score.toFixed(2)}%</option>`).join('');
    document.getElementById('ablation-select').innerHTML = `<option value="">${text('chooseAblationPlaceholder')}</option>${options}`;
    document.getElementById('ablation-select').value = state.ablation || '';
    document.getElementById('ablation-dialog-select').innerHTML = options;
    document.getElementById('ablation-dialog-select').value = state.ablation || ablations[0].id;
    document.querySelectorAll('[data-ablation]').forEach(button => {
      const record = ablationMap.get(button.dataset.ablation);
      button.setAttribute('aria-label', `${record.name} · ${record.score.toFixed(2)}% · ${text('openAblation')}`);
      button.setAttribute('aria-pressed', String(record.id === state.ablation));
    });
  }

  function renderAblation(record) {
    document.getElementById('ablation-name').textContent = record.name;
    document.getElementById('ablation-score').textContent = `AVG · ${numeric(record.score, 2)}%`;
    window.PuroCMA.render(record);
    const order = record.order === 'UD' ? localized([
      '随机数据排布（Uniform Data，UD）：将第二阶段的同一份数据全局打乱后训练。',
      'Uniform Data (UD): globally shuffle the shared Phase 2 data pool before training.',
    ]) : localized([
      '课程排布数据（Curriculum Data，CD）：有质量评分的样本在各数据源内部从低质量到高质量排列，无评分的数据保持固定随机顺序，再按训练进度混合各来源。因此，高质量数据更多地出现在训练后段。',
      'Curriculum Data (CD): order scored samples from lower to higher quality within each source, keep a fixed random order for unscored data, and mix sources at matching points in their progress. Higher-quality data therefore appear later in training.',
    ]);
    let schedule = localized([
      '第二阶段采用线性学习率衰减，训练至结束。',
      'Train Phase 2 to completion with linear learning-rate decay.',
    ]);
    if (record.resumeStep) {
      const step = numeric(record.resumeStep);
      schedule = localized([
        `先使用课程顺序的数据，并采用线性学习率衰减。随后，从第 ${step} 步保存的 checkpoint 恢复训练，继续读取课程数据，将学习率保持为该步的值，不再衰减。`,
        `First train on curriculum-ordered data with linear learning-rate decay. Then resume from the checkpoint saved at step ${step}, continue reading curriculum data, and keep the learning rate at its value at that step instead of decaying it further.`,
      ]);
      if (record.baseLr) {
        schedule += localized([
          ` 基础 LR 固定为 ${record.baseLr.toExponential(2)}。\nMuonH 矩阵参数使用 10 倍系数，对应的有效 LR 为 ${record.matrixLr.toExponential(2)}。`,
          ` The base LR stays at ${record.baseLr.toExponential(2)}. MuonH matrix parameters use a multiplier of 10, giving an effective LR of ${record.matrixLr.toExponential(2)}.`,
        ]);
      }
    }
    let checkpoints;
    if (record.checkpointSteps.length) {
      checkpoints = `<div class="checkpoint-steps">${record.checkpointSteps.map(step => `<span>${numeric(step)}</span>`).join('')}</div>`;
      if (record.averaging) {
        checkpoints += `<p>${localized([
          '前五个 checkpoint 间隔 100 步，最后一个间隔 69 步。平均窗口从 222,100 到 222,569，共 469 步，约 2.95B tokens。',
          'The first five checkpoints are 100 steps apart. The last gap is 69 steps. The averaging window runs from 222,100 to 222,569, spanning 469 steps, or about 2.95B tokens.',
        ])}</p>`;
      }
    } else if (record.averaging) {
      const selection = record.resumeStep ? localized([
        `这组实验从第 ${numeric(record.resumeStep)} 步恢复后继续训练。取其最后 ${record.checkpointCount} 个 checkpoint。`,
        `Take ${record.checkpointCount} late checkpoints from the continuation resumed at step ${numeric(record.resumeStep)}.`,
      ]) : localized([
        '取学习率衰减训练结束前保存的 checkpoint。',
        'Take checkpoints saved near the end of training with learning-rate decay.',
      ]);
      checkpoints = `${escaped(selection)}<p>${localized([
        '原文未逐项列出这组参与平均的 checkpoint 步数。',
        'The paper does not list the individual checkpoint steps for this averaged configuration.',
      ])}</p>`;
    } else {
      checkpoints = localized(['该实验训练结束时的最后一个 checkpoint。', 'The final checkpoint from this training run.']);
    }
    let averaging = localized(['直接使用最终 checkpoint 的模型参数。', 'Use the final checkpoint’s model parameters directly.']);
    if (record.averaging) {
      averaging = localized([
        '对这些 checkpoint 中对应位置的参数求平均（SMA），并用平均后的模型评测。优化器状态不参与平均。',
        'Average corresponding parameters across these checkpoints (SMA), then evaluate the resulting model. Optimizer states are not averaged.',
      ]);
    }
    const fields = [['dataOrder', escaped(order)], ['learningRate', escaped(schedule)], ['checkpointSelection', checkpoints], ['modelAveraging', averaging]];
    document.getElementById('ablation-fields').innerHTML = `<dl class="model-fields ablation-fields">${fields.map(([key, value]) => `<div><dt>${text(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  }

  function openAblation(identifier, trigger) {
    const record = ablationMap.get(identifier);
    if (!record) return;
    state.ablation = identifier;
    ablationReturnFocus = trigger || document.activeElement;
    hideTooltip();
    renderAblation(record);
    renderAblationControls();
    if (!ablationDialog.open) ablationDialog.showModal();
    ablationDialog.querySelector('.ablation-close').focus();
  }

  function openModel(identifier, trigger) {
    const model = modelMap.get(identifier);
    if (!model) return;
    state.model = model; returnFocus = trigger || document.activeElement;
    renderModel(model); hideTooltip();
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  }

  function renderLedger() {
    const rows = models.filter(model => model.table7).map(model => `<tr><th scope="row"><button type="button" data-model="${model.id}">${escaped(modelLabel(model))}</button></th><td>${modelType(model)}</td><td>${text(model.evidence)}</td><td>${text(model.price)}</td><td>${numeric(model.gpuHours)}</td><td>¥${numeric(model.rmb)}</td><td>$${numeric(model.usd)}</td><td>${numeric(model.average, 2)}%</td></tr>`);
    document.getElementById('cost-table').innerHTML = `<table class="cost-table"><caption>Table 7</caption><thead><tr>${['modelName', 'type', 'method', 'price', 'hours', 'rmb', 'usd', 'average'].map(key => `<th scope="col">${text(key).replace(/^\d\. /, '')}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
    document.getElementById('model-select').innerHTML = `<option value="">${text('chooseModelPlaceholder')}</option>${models.map(model => `<option value="${model.id}">${escaped(modelLabel(model))}</option>`).join('')}`;
    document.getElementById('model-dialog-select').innerHTML = models.map(model => `<option value="${model.id}">${escaped(modelLabel(model))}</option>`).join('');
  }

  function renderFigureTitle() {
    if (!figureState) return;
    const title = data.figureLabels[figureState.key][state.language];
    document.getElementById('figure-viewer-title').textContent = title;
    figureImage.alt = title;
  }

  function layoutFigure(reset = false) {
    if (!figureState || !figureDialog.open) return;
    const previousWidth = figureImage.getBoundingClientRect().width || 1;
    const horizontalCenter = (figureViewport.scrollLeft + figureViewport.clientWidth / 2) / previousWidth;
    const verticalCenter = (figureViewport.scrollTop + figureViewport.clientHeight / 2) / previousWidth;
    const fitWidth = Math.max(1, Math.min(figureState.width, figureViewport.clientWidth - 32, (figureViewport.clientHeight - 32) * figureState.ratio));
    const width = fitWidth * figureState.scale;
    figureImage.style.width = `${width}px`;
    document.getElementById('figure-zoom-level').textContent = `${Math.round(figureState.scale * 100)}%`;
    document.getElementById('figure-zoom-out').disabled = figureState.scale <= 1;
    document.getElementById('figure-zoom-in').disabled = figureState.scale >= 4;
    figureViewport.scrollLeft = reset ? 0 : horizontalCenter * width - figureViewport.clientWidth / 2;
    figureViewport.scrollTop = reset ? 0 : verticalCenter * width - figureViewport.clientHeight / 2;
  }

  function openFigure(key, trigger) {
    const source = document.querySelector(`.figure-image[data-figure="${key}"]`);
    if (!source || !data.figureLabels[key]) return;
    hideTooltip();
    figureReturnFocus = trigger;
    const width = Number(source.getAttribute('width'));
    const height = Number(source.getAttribute('height'));
    figureState = { key, width, ratio: width / height, scale: 1 };
    figureImage.src = source.currentSrc || source.src;
    renderFigureTitle();
    figureDialog.showModal();
    layoutFigure(true);
    figureDialog.querySelector('.figure-close').focus();
  }

  function changeFigureZoom(delta) {
    if (!figureState) return;
    figureState.scale = Math.min(4, Math.max(1, figureState.scale + delta));
    layoutFigure();
  }

  function updateChartOverflow(chart) {
    const overflowing = chart.scrollWidth > chart.clientWidth + 2;
    const frame = chart.closest('.chart-frame');
    const hint = document.getElementById(`${chart.id}-scroll-hint`);
    hint.hidden = !overflowing;
    frame.classList.toggle('can-scroll-left', overflowing && chart.scrollLeft > 2);
    frame.classList.toggle('can-scroll-right', overflowing && chart.scrollLeft + chart.clientWidth < chart.scrollWidth - 2);
    chart.setAttribute('tabindex', overflowing ? '0' : '-1');
    chart.setAttribute('role', 'group');
    chart.setAttribute('aria-label', text(chart.dataset.chart === 'cost' ? 'costChart' : 'efficiencyChart'));
    if (overflowing) chart.setAttribute('aria-describedby', hint.id);
    else chart.removeAttribute('aria-describedby');
  }

  function updateChartHints() {
    document.querySelectorAll('[data-chart]').forEach(updateChartOverflow);
  }

  function updateCompactHeader() {
    const wasCompact = document.documentElement.classList.contains('header-compact');
    const compact = window.innerWidth <= 600 && window.scrollY > (wasCompact ? 80 : 160);
    document.documentElement.classList.toggle('header-compact', compact);
  }

  function starPath(centerX, centerY, radius) {
    return Array.from({ length: 10 }, (_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      const length = index % 2 ? radius * 0.43 : radius;
      return `${index ? 'L' : 'M'}${centerX + Math.cos(angle) * length},${centerY + Math.sin(angle) * length}`;
    }).join(' ') + ' Z';
  }

  function renderScatter() {
    const language = 'en';
    const width = 1100, height = 555, left = 68, right = 1068, top = 28, bottom = 488;
    const costX = cost => left + Math.log(cost / 3700) / Math.log(1750000 / 3700) * (right - left);
    const scoreY = score => bottom - (score - 23) / 45 * (bottom - top);
    const offsets = {
      'model-1': [0, -16, 'middle'], 'model-2': [-10, -13, 'end'], 'model-3': [-12, 21, 'end'],
      'model-4': [12, 22, 'start'], 'model-5': [12, -12, 'start'], 'model-6': [-14, -16, 'end'],
      'model-7': [12, -15, 'start'], 'model-8': [12, -15, 'start'], 'model-9': [12, 22, 'start'],
      'model-10': [12, 22, 'start'], 'model-11': [12, -13, 'start'], 'model-12': [12, -14, 'start'],
      'model-13': [-12, 23, 'end'], 'model-14': [12, -15, 'start'], 'puro-44': [10, 24, 'start'],
    };
    const names = { 'model-3': 'Qwen3-1.7B', 'model-7': 'LFM2.5-1.2B', 'model-8': 'Falcon-H1-Deep-1.5B', 'model-10': 'OLMoE-A1B/7B', 'model-12': 'SmolLM3-3B', 'model-13': 'MobileLLM-R1-950M', 'model-14': 'Puro-2B ($6.9K)', 'puro-44': 'Puro-2B (UD, $4.4K)' };
    let svg = `<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="${text('costChart', language)}" class="cost-chart"><rect width="${width}" height="${height}" fill="white"/>`;
    for (let score = 25; score <= 65; score += 5) {
      const position = scoreY(score);
      svg += `<line x1="${left}" x2="${right}" y1="${position}" y2="${position}" class="plot-grid"/><text x="${left - 13}" y="${position + 5}" text-anchor="end" class="tick">${score}</text>`;
    }
    [[5000, '$5K'], [10000, '$10K'], [30000, '$30K'], [100000, '$100K'], [300000, '$300K'], [1000000, '$1M']].forEach(([cost, label]) => {
      const position = costX(cost);
      svg += `<line x1="${position}" x2="${position}" y1="${top}" y2="${bottom}" class="plot-grid"/><text x="${position}" y="${bottom + 24}" text-anchor="middle" class="tick">${label}</text>`;
    });
    svg += `<path d="M${left} ${top}V${bottom}H${right}" class="plot-axis"/><text x="${(left + right) / 2}" y="${height - 14}" text-anchor="middle" class="axis-title">${text('costAxis', language)}</text><text transform="translate(20 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle" class="axis-title">${text('scoreAxis', language)}</text>`;
    const frontier = [];
    let bestScore = -Infinity;
    models.filter(model => model.type !== 'ours').sort((first, second) => first.plotUsd - second.plotUsd || second.mean - first.mean).forEach(model => {
      if (model.mean > bestScore) { frontier.push(model); bestScore = model.mean; }
    });
    svg += `<polyline points="${frontier.map(model => `${costX(model.plotUsd)},${scoreY(model.mean)}`).join(' ')}" fill="none" stroke="#858b91" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    svg += `<line x1="${left}" x2="${right}" y1="${scoreY(models[0].mean)}" y2="${scoreY(models[0].mean)}" stroke="#c3797a" stroke-width="1.2" stroke-dasharray="7 5"/><text x="${right - 5}" y="${scoreY(models[0].mean) - 7}" text-anchor="end" class="threshold-label">Qwen2-1.5B · 55.14</text>`;
    models.forEach(model => {
      const horizontal = costX(model.plotUsd), vertical = scoreY(model.mean);
      const color = model.type === 'ours' ? '#c96760' : model.type === 'open_weight' ? '#466786' : '#388b87';
      const fill = model.evidence.startsWith('6ND') ? '#fff' : color;
      let shape;
      if (model.type === 'ours') shape = `<path d="${starPath(horizontal, vertical, 10)}" fill="${color}" stroke="#9c504d" stroke-width="1.1"/>`;
      else if (model.type === 'open_weight') shape = `<rect x="${horizontal - 5}" y="${vertical - 5}" width="10" height="10" fill="${fill}" stroke="${color}" stroke-width="1.8"/>`;
      else shape = `<circle cx="${horizontal}" cy="${vertical}" r="5.5" fill="${fill}" stroke="${color}" stroke-width="1.8"/>`;
      const [offsetX, offsetY, anchor] = offsets[model.id];
      svg += `<g role="button" tabindex="0" class="model-mark" data-model="${model.id}" aria-label="${escaped(modelLabel(model))}, ${model.average.toFixed(2)}%, ${model.usd}. ${text('openDetails', language)}"><rect x="${horizontal - 14}" y="${vertical - 14}" width="28" height="28" class="hit-area"/>${shape}<text x="${horizontal + offsetX}" y="${vertical + offsetY}" text-anchor="${anchor}" class="model-label" fill="${color}">${escaped(names[model.id] || model.name)}</text></g>`;
    });
    svg += `<g class="plot-legend" transform="translate(698 315)"><rect x="-17" y="-23" width="379" height="166" rx="3" fill="#fff" stroke="#d7dce0"/><rect x="0" y="-7" width="10" height="10" fill="#466786"/><text x="22" y="3">${text('openWeight', language)}</text><circle cx="5" cy="24" r="5" fill="#388b87"/><text x="22" y="29">${text('fullyOpen', language)}</text><circle cx="5" cy="50" r="5" fill="#75828b"/><text x="22" y="55">${text('reported', language)}</text><circle cx="5" cy="76" r="5" fill="white" stroke="#75828b" stroke-width="1.7"/><text x="22" y="81">${text('estimated', language)}</text><path d="${starPath(5, 102, 8)}" fill="#c96760"/><text x="22" y="107">${text('finalPuro', language)}</text><line x1="-3" x2="13" y1="127" y2="127" stroke="#858b91" stroke-dasharray="4 3"/><text x="22" y="132">${text('frontier', language)}</text></g></svg>`;
    document.getElementById('chart-cost').innerHTML = svg;
  }

  function renderEfficiency() {
    const language = 'en';
    const legendTop = 12, legendRowHeight = 24;
    const legendHeight = data.research.factors.length * legendRowHeight + 15;
    const plotTop = legendTop + legendHeight + 24;
    const baseline = plotTop + 315, scale = 87, height = baseline + 60;
    const colors = ['#e6a69d', '#9cb4c9', '#82c2bc', '#becbd5'];
    let svg = `<svg viewBox="0 0 740 ${height}" class="efficiency-chart" role="group" aria-label="${text('efficiencyChart', language)}"><title>${text('efficiencyChart', language)}</title><defs><pattern id="estimate-hatching" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f4f7fa"/><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="#a9b6c5"/></pattern></defs><rect width="740" height="${height}" fill="white"/>`;
    for (let value = 0; value <= 3.5; value += 0.5) {
      const position = baseline - value * scale;
      svg += `<line x1="72" x2="715" y1="${position}" y2="${position}" class="plot-grid"/><text x="60" y="${position + 5}" class="tick" text-anchor="end">${value.toFixed(1)}</text>`;
    }
    svg += `<path d="M72 ${plotTop}V${baseline}H715" class="plot-axis"/><text transform="translate(24 ${(plotTop + baseline) / 2}) rotate(-90)" text-anchor="middle" class="axis-title">${text('multiplierAxis', language)}</text>`;
    svg += `<g class="factor-legend"><rect x="113" y="${legendTop}" width="590" height="${legendHeight}" rx="3" fill="white" stroke="#d7dce0"/>`;
    data.research.factors.forEach((factor, index) => {
      svg += `<rect x="125" y="${legendTop + 12 + index * legendRowHeight}" width="20" height="11" fill="${index === 3 ? 'url(#estimate-hatching)' : colors[index]}" stroke="#748592"/><text x="155" y="${legendTop + 23 + index * legendRowHeight}">${escaped(localized(evidenceDescriptions[factor.factor].comparison, language))}</text>`;
    });
    svg += '</g>';
    data.research.factors.forEach((factor, index) => {
      const horizontal = 98 + index * 158, barHeight = factor.multiplier * scale;
      svg += `<a href="#evidence-${factor.factor}" class="efficiency-link" data-evidence-jump="${factor.factor}" aria-label="${text(factor.factor, language)} ${factor.multiplier.toFixed(2)}×. ${text('evidence', language)}"><title>${text(factor.factor, language)}: ${localized(evidenceDescriptions[factor.factor].comparison, language)}</title><rect x="${horizontal - 7}" y="${baseline - barHeight - 35}" width="132" height="${barHeight + 80}" class="hit-area"/><rect x="${horizontal}" y="${baseline - barHeight}" width="114" height="${barHeight}" fill="${index === 3 ? 'url(#estimate-hatching)' : colors[index]}" stroke="#748592"/><text x="${horizontal + 57}" y="${baseline - barHeight - 12}" text-anchor="middle" class="bar-value">${factor.multiplier.toFixed(2)}×</text><text x="${horizontal + 57}" y="${baseline + 28}" text-anchor="middle" class="bar-label">${text(factor.factor, language)}</text></a>`;
    });
    svg += '</svg>';
    document.getElementById('chart-efficiency').innerHTML = svg;
  }

  function renderEvidence() {
    data.research.factors.forEach(factor => {
      const details = evidenceDescriptions[factor.factor];
      document.querySelector(`[data-evidence-label="${factor.factor}"]`).textContent = `${factor.multiplier.toFixed(2)}× · ${text('evidence')}`;
      const paragraphs = localized(details.paragraphs).map(paragraph => `<p>${escaped(paragraph)}</p>`).join('');
      const sources = details.sources.map(source => `<a href="https://arxiv.org/pdf/2608.27370v2#page=${source.page}" target="_blank" rel="noopener noreferrer">${escaped(localized(source.label))} ↗</a>`).join('');
      const figureNumber = data.figureLabels[details.figure].number;
      document.querySelector(`[data-evidence="${factor.factor}"]`).innerHTML = `<p class="evidence-baseline">${escaped(localized(details.comparison))}</p>${paragraphs}<p class="evidence-links"><a href="#figure-${details.figure}">${text('backToFigure')} ${figureNumber} ↑</a><span class="evidence-sources"><span>${text('paperSources')}</span>${sources}</span></p>`;
    });
  }

  function renderReferences() {
    referenceNotes.forEach(note => {
      const reference = referenceMap.get(Number(note.dataset.reference));
      const title = state.language === 'en' ? reference.titleEn || reference.title : reference.title;
      note.querySelector('.reference-title').textContent = title;
      note.setAttribute('aria-label', `${text('references')} ${reference.id}`);
    });
    updateReferenceAccess();
    document.querySelectorAll('[data-toc]').forEach(link => {
      if (link.dataset.toc === state.section) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function setLanguage(language, remember = true) {
    state.language = language === 'en' ? 'en' : 'zh';
    document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-copy]').forEach(element => { element.innerHTML = data[state.language][element.dataset.copy]; });
    document.querySelectorAll('[data-ui]').forEach(element => { element.textContent = text(element.dataset.ui); });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === state.language)));
    document.title = document.querySelector('.article h1').textContent;
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(element => element.setAttribute('content', text('description')));
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(element => element.setAttribute('content', document.title));
    document.querySelector('meta[property="og:locale"]').setAttribute('content', state.language === 'en' ? 'en_US' : 'zh_CN');
    document.querySelectorAll('.dialog-close, .ablation-close, .toc-close, .figure-close').forEach(button => button.setAttribute('aria-label', text('close')));
    document.querySelectorAll('[data-citation]').forEach(link => link.setAttribute('aria-label', `${text('references')} ${link.dataset.citation}`));
    document.querySelectorAll('.citations').forEach(group => group.setAttribute('aria-label', text('references')));
    tocPanel.setAttribute('aria-label', text('contents'));
    scrim.setAttribute('aria-label', text('close'));
    renderLedger(); renderEvidence(); renderReferences();
    renderAblationControls();
    window.PuroELR?.setLanguage(state.language);
    document.querySelectorAll('[data-figure]').forEach(image => { image.alt = data.figureLabels[image.dataset.figure][state.language]; });
    if (state.model) renderModel(state.model);
    if (state.ablation) renderAblation(ablationMap.get(state.ablation));
    renderFigureTitle();
    updateChartHints();
    hideTooltip();
    if (remember) { try { localStorage.setItem('puro-language', state.language); } catch {} }
  }

  function setToc(open, restoreFocus = false) {
    tocOpen = open;
    document.body.classList.toggle('toc-collapsed', !open);
    document.body.classList.toggle('toc-mobile-open', open && narrowLayout.matches);
    tocToggle.setAttribute('aria-expanded', String(open));
    tocPanel.inert = !open;
    tocPanel.setAttribute('aria-hidden', String(!open));
    scrim.hidden = !open || !narrowLayout.matches;
    if (restoreFocus) tocToggle.focus();
    requestAnimationFrame(updateChartHints);
  }

  function updateReferenceAccess() {
    citationLinks.forEach(citation => {
      const note = document.getElementById(citation.getAttribute('aria-controls'));
      const expanded = !narrowLayout.matches || note.classList.contains('is-open');
      if (narrowLayout.matches) citation.setAttribute('aria-expanded', String(expanded));
      else citation.removeAttribute('aria-expanded');
      note.setAttribute('aria-hidden', String(!expanded));
    });
  }

  function setReference(citation, restoreFocus = false) {
    const previousCitation = activeCitation;
    activeCitation = citation;
    referenceNotes.forEach(note => {
      const active = note.id === citation?.getAttribute('aria-controls');
      note.classList.toggle('is-open', active);
      note.classList.toggle('reference-highlight', active);
    });
    updateReferenceAccess();
    if (restoreFocus) previousCitation?.focus({ preventScroll: true });
  }

  function revealReferenceHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.matches('.reference-note')) return;
    const citation = citationLinks.find(link => link.getAttribute('aria-controls') === target.id);
    setReference(citation);
    requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'instant' }));
  }

  function updateSection() {
    const sections = [...document.querySelectorAll('[data-section]')];
    const reached = sections.filter(section => section.getBoundingClientRect().top <= 180);
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    const current = atBottom ? sections.at(-1) : reached.at(-1) || sections[0];
    if (current.id !== state.section) { state.section = current.id; renderReferences(); }
  }

  document.addEventListener('click', event => {
    const articleLink = event.target.closest('[data-article-jump]');
    if (articleLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      const target = document.getElementById(articleLink.dataset.articleJump || articleLink.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (dialog.open) { returnFocus = null; dialog.close(); }
      if (narrowLayout.matches && tocOpen) setToc(false);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      history.pushState(null, '', `#${target.id}`);
      target.focus({ preventScroll: true });
      (target.closest('.figure-unit') || target).scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    const figureTrigger = event.target.closest('[data-zoom-figure]');
    if (figureTrigger) { openFigure(figureTrigger.dataset.zoomFigure, figureTrigger); return; }
    const ablationTrigger = event.target.closest('[data-ablation]');
    if (ablationTrigger) { event.preventDefault(); openAblation(ablationTrigger.dataset.ablation, ablationTrigger); return; }
    const modelTrigger = event.target.closest('[data-model]');
    if (modelTrigger) { openModel(modelTrigger.dataset.model, modelTrigger); return; }
    const languageTrigger = event.target.closest('[data-language]');
    if (languageTrigger) { setLanguage(languageTrigger.dataset.language); return; }
    const evidenceTrigger = event.target.closest('[data-evidence-jump]');
    if (evidenceTrigger) {
      event.preventDefault();
      const target = document.getElementById(`evidence-${evidenceTrigger.dataset.evidenceJump}`);
      target.open = true;
      history.replaceState(null, '', `#${target.id}`);
      target.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      target.querySelector('summary').focus({ preventScroll: true });
      return;
    }
    const citation = event.target.closest('[data-citation]');
    if (citation) {
      event.preventDefault();
      if (narrowLayout.matches && activeCitation === citation) { setReference(null, true); return; }
      if (narrowLayout.matches && tocOpen) setToc(false);
      setReference(citation);
      const reference = document.getElementById(citation.getAttribute('aria-controls'));
      reference.focus({ preventScroll: true });
      if (!narrowLayout.matches) reference.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });
  document.addEventListener('keydown', event => {
    const marker = event.target.closest('.model-mark');
    if (marker && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openModel(marker.dataset.model, marker); }
    if (event.key === 'Escape') { hideTooltip(); if (activeCitation) setReference(null, true); if (tocOpen && narrowLayout.matches) setToc(false, true); }
    if (event.key === 'Tab' && tocOpen && narrowLayout.matches && !dialog.open && !ablationDialog.open && !figureDialog.open) {
      const focusable = [...tocPanel.querySelectorAll('button, a')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const trigger = tooltipTarget(event.target);
    if (trigger) showTooltip(trigger);
  });
  document.addEventListener('pointerout', event => {
    if (event.pointerType === 'touch') return;
    const trigger = tooltipTarget(event.target);
    if (trigger && trigger === tooltipAnchor && trigger !== tooltipTarget(event.relatedTarget)) scheduleTooltipHide();
  });
  document.addEventListener('focusin', event => {
    const trigger = tooltipTarget(event.target);
    if (trigger?.matches(':focus-visible')) showTooltip(trigger);
  });
  document.addEventListener('focusout', event => { if (tooltipTarget(event.target) === tooltipAnchor) hideTooltip(); });
  tooltip.addEventListener('pointerenter', () => clearTimeout(tooltipDismissTimer));
  tooltip.addEventListener('pointerleave', scheduleTooltipHide);
  document.getElementById('model-select').addEventListener('change', event => { if (event.target.value) openModel(event.target.value, event.target); });
  document.getElementById('ablation-select').addEventListener('change', event => { if (event.target.value) openAblation(event.target.value, event.target); });
  document.getElementById('model-dialog-select').addEventListener('change', event => {
    const model = modelMap.get(event.target.value);
    if (!model) return;
    state.model = model;
    renderModel(model);
    dialog.scrollTop = 0;
  });
  document.getElementById('ablation-dialog-select').addEventListener('change', event => {
    const record = ablationMap.get(event.target.value);
    if (!record) return;
    state.ablation = record.id;
    renderAblation(record);
    renderAblationControls();
    ablationDialog.scrollTop = 0;
  });
  document.getElementById('figure-zoom-in').addEventListener('click', () => changeFigureZoom(.5));
  document.getElementById('figure-zoom-out').addEventListener('click', () => changeFigureZoom(-.5));
  document.getElementById('figure-zoom-fit').addEventListener('click', () => { if (figureState) { figureState.scale = 1; layoutFigure(true); } });
  figureDialog.querySelector('.figure-close').addEventListener('click', () => figureDialog.close());
  figureDialog.addEventListener('click', event => {
    const bounds = figureDialog.getBoundingClientRect();
    if (event.target === figureDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) figureDialog.close();
  });
  figureDialog.addEventListener('close', () => {
    figureState = null;
    figureDrag = null;
    figureViewport.classList.remove('is-dragging');
    if (figureReturnFocus?.isConnected) figureReturnFocus.focus({ preventScroll: true });
  });
  figureViewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    figureViewport.focus({ preventScroll: true });
    figureDrag = { left: figureViewport.scrollLeft, top: figureViewport.scrollTop, horizontal: event.clientX, vertical: event.clientY };
    figureViewport.setPointerCapture(event.pointerId);
    figureViewport.classList.add('is-dragging');
  });
  figureViewport.addEventListener('pointermove', event => {
    if (!figureDrag) return;
    figureViewport.scrollLeft = figureDrag.left + figureDrag.horizontal - event.clientX;
    figureViewport.scrollTop = figureDrag.top + figureDrag.vertical - event.clientY;
  });
  figureViewport.addEventListener('lostpointercapture', () => { figureDrag = null; figureViewport.classList.remove('is-dragging'); });
  ablationDialog.querySelector('.ablation-close').addEventListener('click', () => ablationDialog.close());
  ablationDialog.addEventListener('click', event => {
    const bounds = ablationDialog.getBoundingClientRect();
    if (event.target === ablationDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) ablationDialog.close();
  });
  ablationDialog.addEventListener('close', () => {
    state.ablation = null;
    renderAblationControls();
    if (ablationReturnFocus?.isConnected) ablationReturnFocus.focus({ preventScroll: true });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.getElementById('model-select').value = ''; if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); });
  tocToggle.addEventListener('click', () => { setToc(!tocOpen); if (tocOpen && narrowLayout.matches) tocPanel.querySelector('button').focus(); });
  document.querySelector('.toc-close').addEventListener('click', () => setToc(false, true));
  scrim.addEventListener('click', () => setToc(false, true));
  tocPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (narrowLayout.matches) setToc(false); }));
  narrowLayout.addEventListener('change', event => { setToc(tocOpen && !event.matches); updateReferenceAccess(); });
  let scrollPending = false;
  window.addEventListener('scroll', () => {
    hideTooltip();
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(() => { updateCompactHeader(); updateSection(); scrollPending = false; }); }
  }, { passive: true, capture: true });
  window.addEventListener('resize', () => { hideTooltip(); updateCompactHeader(); updateChartHints(); layoutFigure(); });
  window.addEventListener('blur', hideTooltip);
  window.addEventListener('hashchange', () => { const target = document.getElementById(location.hash.slice(1)); if (target?.matches('details')) target.open = true; revealReferenceHash(); updateSection(); });
  let savedLanguage = 'zh';
  try { savedLanguage = localStorage.getItem('puro-language') || 'zh'; } catch {}
  renderScatter(); renderEfficiency();
  document.querySelectorAll('[data-zoom-figure]').forEach(button => { button.hidden = false; });
  document.querySelectorAll('[data-chart]').forEach(chart => chart.addEventListener('scroll', () => updateChartOverflow(chart), { passive: true }));
  document.getElementById('ablation-hotspots').hidden = false;
  document.getElementById('ablation-controls').hidden = false;
  document.body.classList.add('references-ready');
  setLanguage(savedLanguage, false); setToc(tocOpen);
  const initialTarget = document.getElementById(location.hash.slice(1));
  if (initialTarget?.matches('details')) initialTarget.open = true;
  revealReferenceHash();
  updateCompactHeader(); updateSection();
})();
