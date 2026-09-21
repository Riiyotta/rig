// Blog data (CLONE_SPEC.md Part 2 §P1 / §P2.5). All wording here is ORIGINAL
// placeholder copy; only the slugs, the newest-first order/dates and the
// per-post block shape (types, counts, rough lengths) follow the original.
//
// Block types rendered by src/pages/BlogPost.jsx:
//   { type: 'p', text }            paragraph (inline: **bold**, *italic*, [label](href))
//   { type: 'h2' | 'h3' | 'h4', text }
//   { type: 'ul' | 'ol', items: [text, ...] }
//   { type: 'blockquote', text }    inline text directly inside <blockquote>
//   { type: 'figure', alt }         diagram slot (origin image 502s -> placeholder box)
//   { type: 'code', code }          <pre><code> (declared in .prose, unused by the posts)
//   { type: 'hr' }

export const blogCopy = {
  indexTitle: 'Blog',
  byPrefix: 'By',
  backLabel: 'All Posts',
  notFoundTitle: 'Post not found',
  notFoundBody: 'There is no post at this address. It may have moved, or the link may be mistyped.',
  diagramCaption: 'Diagram placeholder',
  cta: {
    title: 'Want to try it for real?',
    lines: ['We’re inviting engineers in small batches every single week.', 'Grab your spot in line.'],
  },
}

const series = (self, extra = '') => {
  const parts = [
    ['[the inference engine](/blog/building-inference-engine)', 'building-inference-engine'],
    ['[model compression](/blog/compressing-a-model-to-run-locally)', 'compressing-a-model-to-run-locally'],
    ['[training for code](/blog/teaching-a-model-to-code)', 'teaching-a-model-to-code'],
  ].filter(([, slug]) => slug !== self)
  return `*This post is one part of an ongoing series about how Rig works under the hood. The other entries cover ${parts[0][0]} and ${parts[1][0]}.${extra}*`
}

export const posts = [
  {
    slug: 'building-inference-engine',
    date: '2026-04-16',
    author: 'Rig Engineers',
    title: 'What it takes to build a fast local inference engine',
    excerpt:
      'A tour of the runtime that turns a file of weights into a responsive coding agent on an ordinary laptop, one layer at a time.',
    blocks: [
      { type: 'p', text: 'Most talk about local AI is about the model. The part that decides whether it feels usable is the runtime. We covered how we [shrink the weights](/blog/compressing-a-model-to-run-locally) and how we [train for code](/blog/teaching-a-model-to-code) elsewhere; this post is about what runs them.' },
      { type: 'p', text: 'An inference engine has one job. It takes a prompt, runs the network forward as fast as the hardware allows, and hands back tokens without stalling everything else on the machine. Doing that well on a laptop, next to an editor, a browser and a build, is a very different problem from doing it on a rack of dedicated servers.' },

      { type: 'h2', text: 'Why not use an existing runtime' },
      { type: 'p', text: 'We started where everyone starts, with the popular open runtimes. They are impressive pieces of work and we learned a great deal from reading them. They are also general by design, which means they carry support for dozens of architectures, file formats and hardware backends that we will never touch. Each of those paths is code that has to be loaded, tested and kept working.' },
      { type: 'p', text: 'Generality has a cost, and we did not need it.' },
      { type: 'ul', items: [
        '**Fixed architecture.** We know the shape of every layer ahead of time, so kernels are specialized, not dispatched.',
        '**Fixed formats.** Weights arrive in one packed layout, designed with the compression work, with nothing to convert.',
      ] },
      { type: 'p', text: 'Being narrow let us delete a surprising amount of code before we wrote any of our own. What remained was small enough that a single engineer could hold the whole hot path in their head.' },

      { type: 'h2', text: 'The shape of the problem' },
      { type: 'p', text: 'A coding agent does not look like a chatbot from the runtime’s point of view. Prompts are long, because they include files, diffs and tool output, and replies are often short.' },
      { type: 'ul', items: [
        '**Prefill dominates.** Reading a large context takes far longer than writing the answer, so time to first token is the number users feel most. A request that carries three open files and a test log can spend most of its life in prefill before a single visible character appears.',
        '**Idle is the common case.** Between requests the engine should cost close to nothing, since the laptop has other work to do. Most of a working day is spent reading and typing, not waiting on the agent.',
      ] },
      { type: 'p', text: 'Those two facts pull in different directions. Fast prefill wants large buffers held ready, while idle wants memory handed back.' },
      { type: 'p', text: 'Most of the design decisions below come from trying to satisfy both at once. Wherever the two conflict, we lean toward keeping the machine responsive for the person using it, and accept a slightly slower start on the occasional long request. That trade shows up again and again in the sections that follow.' },

      { type: 'h2', text: 'Memory is the real budget' },
      { type: 'p', text: 'On a server you think about compute first. On a laptop you think about memory first, because it is shared with the browser, the editor, the compiler and everything else the developer has open.' },
      { type: 'p', text: 'The weights are the largest fixed cost, and we map them straight from disk rather than copying them into a private allocation. The operating system can then share and page them like any other file, and a cold start does not need to read the whole model before the first request. If the machine comes under pressure, the system can drop clean pages and read them back later without the engine doing anything special. It never holds a second copy of the weights.' },
      { type: 'p', text: 'The second cost is the key-value cache, which grows with context length. A naive cache sized for the maximum context would claim gigabytes the moment the engine starts, so we allocate it in fixed pages and commit them only as a conversation grows.' },
      { type: 'p', text: 'Pages that belong to a finished request go back into a free list. If the list grows past a threshold while the engine is idle, we release it to the system entirely. The effect is that memory use tracks what the user is doing rather than what the configuration allows. A short question costs a few pages; a long refactor across many files costs more, and gives it back when it is done. Nothing is reserved just in case.' },
      { type: 'p', text: 'We also keep a small budget of headroom that the engine will never spend, no matter how large the request. When the machine is under pressure, it is better for us to slow down than for the editor to start swapping. The headroom is measured, not guessed: on start-up the engine checks how much memory the system can spare and sizes its limits from that, then rechecks periodically. If another application grows, the engine shrinks its ceiling to match rather than competing for the same space.' },

      { type: 'h2', text: 'Kernels written for one model' },
      { type: 'p', text: 'The core of any engine is a handful of operations repeated millions of times: matrix multiplies, attention, normalization and a few element-wise steps in between. Nearly all of the time goes to the first two, and nearly all of that time is spent moving weights from memory rather than doing arithmetic on them.' },
      { type: 'p', text: 'Fixed layer shapes mean each kernel is compiled for its exact sizes.' },
      { type: 'ul', items: [
        '**Fused dequantization.** Packed weights are expanded inside the multiply rather than in a separate pass, so the full-precision values never touch main memory and the bandwidth saved by compression is not spent again on unpacking.',
        '**Fused attention.** Scores, softmax and the weighted sum run in one kernel that streams through the cache pages in order.',
        '**Merged norms.** Normalization is folded into the neighbouring projection wherever the math allows it, which removes a full read and write of the activations per layer.',
        '**Few launches.** A full forward pass issues a small, fixed number of dispatches, which keeps scheduling overhead flat as context grows.',
        '**One path per backend.** Each supported chip family gets its own tuned variant instead of a portable fallback that is slow everywhere.',
      ] },
      { type: 'p', text: 'None of these ideas are new on their own. The gain came from applying all of them to a single, known model, where every one of them could be pushed further than a general runtime would dare. A general engine has to leave room for layers it has never seen; ours only has to be right about one network, and it can be tested against that network on every change. When a kernel regresses, we know within a single build.' },

      { type: 'h2', text: 'Scheduling requests' },
      { type: 'p', text: 'An agent rarely sends one request at a time. While it is drafting an edit it may also be summarizing a file or checking a command.' },
      { type: 'ol', items: [
        '**Classify.** Every request is tagged as interactive or background when it enters the queue.',
        '**Prefill in chunks.** Long prompts are split into slices so a short interactive request is never stuck behind a huge background read.',
        '**Batch the decode.** Generating requests share one forward pass per step.',
        '**Preempt politely.** Background work yields at slice boundaries when something interactive arrives.',
        '**Reuse prefixes.** Requests that start with the same files share their cached pages instead of recomputing them.',
      ] },
      { type: 'p', text: 'Prefix reuse deserves a note of its own. Agents send the same project context again and again with small changes at the end, as they read a file, try an edit, run a test and read the file again. Keeping those shared pages warm is often worth more than any kernel optimization.' },
      { type: 'p', text: 'The scheduler itself is intentionally simple. It is a priority queue with a time slice, and it fits on one screen. Every clever variant we tried was harder to reason about and not measurably faster for real workloads. We tried fair queues, deadlines and a learned length predictor; each looked better on synthetic traces and no better on recordings of real sessions, so the simple version stayed.' },

      { type: 'h2', text: 'Measuring what users feel' },
      { type: 'p', text: 'Throughput numbers are easy to collect and easy to make look good. They also say little about whether the tool feels fast in daily use, so we stopped leading with them early in the project. A runtime can post a high tokens-per-second figure and still feel sluggish if it pauses before the first token or stutters halfway through.' },
      { type: 'p', text: 'We track the time from a keystroke to the first visible token, the steadiness of the token stream once it starts, and the memory the engine holds while idle. Each is recorded on real laptops running a real editor, a browser and a build in the background, across several generations of hardware. The oldest machines in the lab set the bar; if it feels good there, it feels good everywhere else.' },
      { type: 'p', text: 'Regressions in any of these block a release. A change that improves throughput but adds a visible pause before the first token is treated as a bug.' },
      { type: 'ul', items: [
        '**First token** is time from queueing to the first visible token.',
        '**Stream jitter** is the spread between gaps in a reply.',
        '**Idle footprint** is resident memory after a quiet minute.',
        '**Thermal drift** is slowdown after twenty minutes of use.',
      ] },

      { type: 'h2', text: 'How the pieces fit' },
      { type: 'p', text: 'The full request path, from the editor to the tokens:' },
      { type: 'figure', alt: 'Inference request flow' },
      { type: 'p', text: 'A request enters the local socket, gets classified and queued, has its prefix matched against warm cache pages, runs prefill in slices, and then joins the shared decode batch until it finishes. Nothing in that path leaves the machine.' },

      { type: 'h2', text: 'Working on many chips' },
      { type: 'p', text: 'Laptops vary far more than servers do, and one release must run on all of them.' },
      { type: 'ul', items: [
        '**Probe on first run.** The engine measures memory bandwidth and compute throughput on the actual device before picking kernel variants, rather than trusting a table of model numbers that is always slightly out of date.',
        '**Prefer unified memory.** Where the chip shares memory between processor and graphics, we skip copies entirely and let both sides read the same pages.',
        '**Fall back gracefully.** When no fast path exists, a plain processor path keeps everything working, just slower. It is tested on every release so the fallback never quietly rots.',
        '**Remember the result.** Probe results are cached, so later launches start immediately and only re-probe after a driver or system update.',
      ] },

      { type: 'h2', text: 'Keeping it quiet' },
      { type: 'p', text: 'A tool that runs on your machine should behave like a good neighbour: low power when idle and no network beyond the local socket.' },
      { type: 'ul', items: [
        '**No background downloads.** Updates happen only when the user asks for them, and they are verified locally before anything is replaced.',
        '**No telemetry.** The engine does not report usage, prompts, timings or crashes anywhere. Diagnostics stay in a local log that you can read, share or delete.',
        '**Loopback only.** The socket binds to the local interface and refuses anything else, including other machines on the same network.',
        '**Power aware.** On battery, background jobs run at a lower priority and batch more aggressively, so short interactive requests still feel instant while long summaries wait for a better moment.',
        '**Easy to stop.** Quitting the engine returns every byte of memory it held and removes its socket, leaving nothing running in the background afterwards.',
      ] },

      { type: 'h2', text: 'Where it goes next' },
      { type: 'p', text: 'The model, not the runtime, is now the usual limit.' },
      { type: 'ol', items: [
        '**Speculative decoding** with a tiny draft model, to cut the cost of predictable tokens such as closing brackets, repeated identifiers and boilerplate imports that the main model would otherwise generate one expensive step at a time.',
        '**Smarter prefix caching** that survives restarts, so reopening a project is as fast as never having closed it.',
        '**Finer power control** that lets users trade speed for battery life with a single setting, instead of relying on the defaults we picked for everyone.',
      ] },
      { type: 'p', text: 'Each of these is a small change to a small codebase. That was the point of building narrow in the first place: when the whole engine fits in your head, improving it stays cheap.' },
      { type: 'p', text: 'If you want to see it running on your own hardware, the waitlist is below. We are adding people in small groups so we can watch how the engine behaves on machines we have not tested ourselves, and fix what we find before the next group joins.' },

      { type: 'hr' },
      { type: 'p', text: series('building-inference-engine', ' Each post stands on its own, but they read best in order.') },
      { type: 'p', text: '*Questions or corrections are welcome.*' },
    ],
  },

  {
    slug: 'compressing-a-model-to-run-locally',
    date: '2026-03-31',
    author: 'Rig Engineers',
    title: 'Fitting a large coding model onto an everyday laptop',
    excerpt:
      'Getting a capable model into a few gigabytes without losing what makes it useful took careful measurement and a lot of patience.',
    blocks: [
      { type: 'blockquote', text: 'A quick note before we start. This is the second post in a series about how Rig runs entirely on your own hardware. If you have not read [the first one](/blog/manifesto), it explains why we care about that at all and what we are trying to build.' },

      { type: 'p', text: 'The model we train is too large to run on a typical laptop in its original form. Its weights alone would fill most of the memory on a well-equipped machine, leaving nothing for the editor or the build.' },
      { type: 'p', text: 'So before anything else, we have to make it smaller. This post walks through how we do that, what we measure along the way, and which of the approaches we tried ended up being abandoned, and why.' },
      { type: 'p', text: 'The short version is that compression is a series of trades.' },
      { type: 'p', text: 'Each trade gives up a little quality for a lot of space. The whole game is knowing which losses a coding agent can tolerate.' },
      { type: 'p', text: 'Some losses are invisible in daily use. Others only appear on long edits, where a small drop in accuracy compounds across hundreds of tokens until a function no longer compiles. Telling the two apart is most of the work.' },
      { type: 'p', text: 'We learned to be suspicious of any result that looked too good. A surprising number of them were measurement mistakes.' },
      { type: 'p', text: 'Here is what survived.' },

      { type: 'h2', text: 'The size problem' },
      { type: 'p', text: 'A model’s memory footprint is roughly the number of parameters multiplied by the bytes used to store each one. Training usually happens at sixteen bits per parameter.' },
      { type: 'p', text: 'Most of that precision exists to keep training stable, not because inference needs it. During training, tiny gradient updates accumulate over millions of steps, and rounding them away would stall learning. Once training is finished, the weights stop moving, and the extra precision mostly records noise. That is the headroom compression works with.' },
      { type: 'p', text: 'On top of the weights sits the working memory needed while the model runs: the cache that holds the conversation so far, the activations for the current step, and a handful of scratch buffers. For long coding contexts, the cache alone can rival the weights, because every token the agent has read stays in memory until the request finishes. A single session that opens a dozen files and a long test log can hold tens of thousands of tokens. Multiply that by every layer, and the working set grows fast.' },
      { type: 'p', text: 'We set a hard budget early. The complete system, running a realistic context, had to fit comfortably on a machine with sixteen gigabytes of memory while leaving room for everything else a developer keeps open.' },
      { type: 'p', text: 'That budget ruled out a lot of easy answers. Running a much smaller model would have fit, but it would not have been good enough at the work. Streaming weights from disk would have fit, but it would have been far too slow. We needed the large model, in a small box, at full speed, with nothing leaving the machine.' },
      { type: 'p', text: 'It also meant compression could not be an afterthought applied to a finished model. It had to shape training from the start.' },
      { type: 'p', text: 'Every technique below was judged against that budget.' },

      { type: 'h2', text: 'Measuring before cutting' },
      { type: 'p', text: 'The most important decision we made was to build the evaluation before building the compression. It is very easy to shrink a model and convince yourself it still works because it answers a few questions sensibly.' },
      { type: 'p', text: 'General benchmarks turned out to be poor guides.' },
      { type: 'p', text: 'A compressed model can hold its score on multiple-choice tests while quietly getting worse at the long, structured output that code requires, such as keeping brackets balanced across a hundred lines or remembering a variable name defined far earlier in the file. Those failures do not show up in a single answer. They show up when the model has to stay consistent for a long time, which is exactly what an agent editing real code has to do.' },
      { type: 'p', text: 'We built a suite from real tasks instead. It includes editing an existing function without breaking its callers, writing tests that actually run, following a refactor across several files, explaining a stack trace correctly, updating code after a dependency changes its interface, and cleaning up after a failed migration. Each task lives in a small but realistic project with its own build and tests. Each is scored by executing the result, not by comparing text against a reference answer, so a solution that looks different but works still counts, and a solution that looks right but fails does not. The suite has grown to several thousand tasks across a dozen languages, and it is rebuilt from scratch every quarter so that nothing in it goes stale or leaks into training by accident.' },
      { type: 'p', text: 'Every compression experiment runs the full suite. A change that saves memory but costs more than a small, agreed amount on any task category is rejected, no matter how good it looks elsewhere. The threshold is written down before the experiment starts, so nobody is tempted to move it afterwards.' },
      { type: 'p', text: 'We also track variance. A model that is right on average but inconsistent from one attempt to the next is frustrating, so every task runs several times and the spread is part of the score.' },
      { type: 'p', text: 'This was slow. A full run takes hours. It also saved us from shipping at least three configurations that looked fine in casual use and fell apart on longer edits.' },

      { type: 'h2', text: 'Quantization and pruning' },
      { type: 'p', text: 'Quantization stores each weight with fewer bits. Going from sixteen bits to four cuts the size of the weights to a quarter, which on its own gets most of the way to the budget. The question is how much the model notices, and where.' },
      { type: 'p', text: 'Naive rounding works for most of the network and badly for a small fraction of it.' },
      { type: 'p', text: 'A few weights in each layer carry far more influence than the rest, and rounding them carelessly does real damage. We split each weight matrix into small groups and give every group its own scale, so a single extreme value only distorts its immediate neighbours. We also look at how each layer is actually used on real prompts and spend extra precision on the channels that matter most. Choosing those channels is an experiment of its own: we quantize one layer at a time, measure how much the output moves, and rank the layers by that sensitivity. The ranking is surprisingly stable across model sizes.' },
      { type: 'p', text: 'The result is a mixed scheme. Most of the model sits at four bits, while a small set of sensitive layers, mostly near the input and output, stays at higher precision. The overhead is a few percent of the total.' },
      { type: 'p', text: 'We tried going lower. Three-bit versions fit easily but drifted on long edits in ways that were hard to predict.' },
      { type: 'p', text: 'For a tool people rely on to change their code, unpredictable is worse than slightly slower, so we stopped at four. Quantization also changes how the runtime must work: packed weights have to be unpacked on the fly, inside the same kernel that uses them, or the memory savings disappear into temporary buffers. That is why compression and the engine were designed together.' },
      { type: 'p', text: 'Pruning removes weights altogether. We experimented with unstructured pruning, which zeroes individual weights, and structured pruning, which removes whole attention heads or chunks of feed-forward layers. Unstructured pruning looked good on paper and delivered little in practice, because scattered zeros save memory only if the hardware can skip them efficiently, and most laptop chips cannot. Structured pruning was more useful but needed care. Removing capacity always costs something, so every pruned model was retrained briefly to recover the loss.' },
      { type: 'p', text: 'That retraining is a form of distillation: the smaller model learns to match the outputs of the original on a large set of coding prompts. It learns not only which answer is right but how confident to be about the alternatives.' },
      { type: 'p', text: 'Distillation turned out to be the most valuable tool of all. A pruned model trained to imitate its larger parent keeps far more of the parent’s behaviour than one trained from scratch on the same data. The prompts matter as much as the method: we draw them from the same kinds of tasks the evaluation suite measures, with long files, multi-step edits and plenty of error output. In the end we pruned modestly, kept the cuts that paid for themselves, and reverted the rest.' },

      { type: 'h2', text: 'The context problem' },
      { type: 'p', text: 'Once the weights fit, the cache became the bottleneck. Coding contexts are long, because the agent needs to see the files it is working on, and the cache grows in direct proportion to the tokens held.' },
      { type: 'h3', text: 'Compressing the cache' },
      { type: 'p', text: 'The cache can be quantized just like the weights. We store it at reduced precision and expand it inside the attention kernel. The loss is smaller than for weights, because each cached value is used briefly and then combined with many others, which averages out much of the rounding error. As with the weights, precision is chosen per layer. Early layers tolerate heavy compression well, while a few later layers need more care, so the scheme is mixed here as well. We measured each layer separately on long coding sessions before settling on the final split.' },
      { type: 'p', text: 'We also share cache structure across attention heads where the architecture allows it. Several heads read from the same keys and values instead of each keeping a private copy, which cuts cache size by a large factor. The cost is small and measurable, and the evaluation suite considers it acceptable. This decision had to be made before training, since it changes the shape of the model itself, which is another reason compression could not be left until the end.' },
      { type: 'p', text: 'Together these changes mean a long coding session holds a fraction of the memory it would otherwise need. A context that would have needed several gigabytes of cache in its original form now fits in a few hundred megabytes, and the difference in quality is within the noise of the suite on almost every task category we track. The exceptions are the longest multi-file edits, where we still see a small but consistent gap, and where we are cautious about claiming too much.' },
      { type: 'p', text: 'We did not get here in one step. The first version of the compressed cache lost too much on long edits, and the second was accurate but slow, because expanding the cache outside the attention kernel doubled the memory traffic. Only when the expansion moved inside the kernel did the numbers line up. Each version went through the full suite, and each failure taught us which layers and which tasks were most sensitive, which in turn shaped the next attempt and the final per-layer choices we ship today.' },
      { type: 'p', text: 'The cache is now a small part of the total footprint.' },
      { type: 'h3', text: 'Choosing what to keep' },
      { type: 'p', text: 'Not everything in a long context matters equally. A file read twenty steps ago is less important than the function being edited now.' },
      { type: 'p', text: 'We experimented with dropping old cache entries automatically based on how much attention they receive. Simple versions of this worked for chat and failed for code, because code has long-range dependencies.' },
      { type: 'p', text: 'Those dependencies look unimportant until suddenly they are the only thing that matters: a type defined at the top of a file, a constant imported from elsewhere, a comment explaining why a check exists. The approach we kept is more conservative. The agent itself decides which files to keep in view, using the same tools a developer would use to navigate a project, such as search, go-to-definition and reading a file in sections. The runtime never silently forgets anything; the model is simply given a smaller, more relevant window to begin with, and it can always read a file again if it needs to. In practice this keeps the context focused and small without losing the details that long edits depend on. It also means the context the model sees is easy for a person to inspect, because it is made of whole files and clear tool results rather than an opaque selection of cached fragments. When something goes wrong, we can look at exactly what the model had in front of it and understand why it made the choice it did.' },
      { type: 'p', text: 'This shifted part of the compression problem from the runtime to the agent’s behaviour, which in turn shaped how we trained it. The agent learns to read what it needs, keep short notes, and let go of the rest. That story belongs to the next post in the series.' },

      { type: 'h2', text: 'What did not work' },
      { type: 'p', text: 'Plenty of ideas did not make it. Aggressive low-rank factorization saved memory but made the model worse at precise instructions.' },
      { type: 'p', text: 'Loading experts on demand added pauses mid-edit.' },
      { type: 'p', text: 'We also tried compressing the vocabulary. Code uses a lot of rare tokens, and trimming the vocabulary made the model split identifiers into awkward pieces, which hurt both speed and accuracy. We tried compressing different parts of the model for different kinds of files, on the theory that prose and code need different things; it worked, but switching between modes cost more time than the memory it saved. Each idea looked promising in isolation and lost once measured against the full suite on real tasks, usually on the longest edits.' },
      { type: 'p', text: 'We keep a written record of every rejected experiment, including the numbers, because the same ideas come back regularly and the notes save a great deal of time. Several of the ideas above have been proposed again by new people on the team, and the notes let us decide in minutes whether anything has changed enough to try again.' },
      { type: 'p', text: 'The broader lesson is that a compression technique is only as good as the evaluation that judges it. Almost every idea looks fine when you only test the easy cases.' },

      { type: 'h2', text: 'Putting it together' },
      { type: 'p', text: 'The shipped model combines grouped quantization, modest pruning recovered through distillation, a compressed cache and a context-aware agent.' },
      { type: 'p', text: 'Combined, they bring the full system comfortably under our sixteen-gigabyte target while keeping quality on the evaluation suite within a few points of the uncompressed original. On most everyday tasks the difference is not noticeable. The combination also turned out to be faster than the original, not just smaller, because reading fewer bytes from memory is the main cost of running a model on a laptop. Startup improved too: the packed weights are mapped from disk rather than converted on load, so the model is ready within seconds, even on a cold machine. There is still a gap on the hardest tasks, particularly very long multi-file refactors, and closing it is active work.' },

      { type: 'h2', text: 'What comes next' },
      { type: 'p', text: 'Compression will keep improving as the research field moves quickly and hardware keeps changing. Our focus for the next few releases is on narrowing the gap on the hardest tasks and on supporting machines with less memory than our current target. Some of that work is about the model and some is about the tooling around it; faster evaluation runs, for example, would let us try more ideas per week.' },
      { type: 'p', text: 'We also plan to publish more of the evaluation suite.' },
      { type: 'p', text: 'Others should be able to check our work.' },
      { type: 'p', text: 'Comparisons between local models should be based on the kind of tasks developers actually do, not on benchmarks that reward short answers. We would rather be measured on real work than on a leaderboard.' },
      { type: 'p', text: 'If you have a machine you would like supported, tell us.' },
      { type: 'p', text: 'And if you think we are measuring something badly, we would like to hear about that too.' },

      { type: 'hr' },
      { type: 'p', text: series('compressing-a-model-to-run-locally', ' Each post stands on its own, but they read best in order.') },
    ],
  },

  {
    slug: 'teaching-a-model-to-code',
    date: '2026-03-24',
    author: 'Rig Engineers',
    title: 'Teaching a model real work',
    excerpt:
      'Writing a plausible function is easy for a model. Making careful, useful changes inside a real project is a very different skill.',
    blocks: [
      { type: 'blockquote', text: 'This post is part of a series on how Rig works. It covers how we train the model behind the agent, and why training for real software work looks so different from training for general chat.' },

      { type: 'p', text: 'Writing code and helping someone write code are different skills.' },
      { type: 'p', text: 'The first produces convincing snippets on demand. The second can open an unfamiliar project, understand what is going on, and make a change that still works tomorrow. Most public training data teaches the first skill. It is full of complete, self-contained examples: a question and an answer, a function and its tests.' },
      { type: 'p', text: 'Real work is rarely like that. We started by watching how engineers actually spend their time, and very little of it is writing new code from scratch. Most of it is reading, searching, running things, and making small, careful edits to code that already exists, often written by someone else, years ago, for reasons nobody wrote down.' },
      { type: 'p', text: 'A typical task might involve tracing a value through three files, changing one line, running the tests and fixing what broke.' },
      { type: 'p', text: 'None of that fits in a single prompt and answer.' },
      { type: 'p', text: 'It is a loop of actions and observations, and the quality of the final change depends on every step in the loop.' },
      { type: 'p', text: 'It is also a loop that often goes wrong halfway through. Recovering from a failed build is a large part of the job.' },
      { type: 'p', text: 'So we stopped thinking of the model as something that answers questions, and started treating it as something that acts.' },
      { type: 'p', text: 'It takes actions in a workspace and learns from what happens. This post describes how we trained for that.' },

      { type: 'h2', text: 'Small habits that turn out to matter more than anything clever' },
      { type: 'p', text: 'Some of the biggest improvements came from behaviours that look trivial. Experienced engineers do all of them without thinking, and early versions of our model did almost none of them. It would confidently edit a file it had not opened, or skip the tests because it was sure the change was right, and then spend ten steps undoing the damage.' },
      { type: 'p', text: 'The habits we ended up rewarding are simple:' },
      { type: 'p', text: 'They are also easy to state, and hard to learn from examples alone, because most examples only show the finished result.' },
      { type: 'p', text: 'Read before editing.' },
      { type: 'p', text: 'Run the tests before changing anything.' },
      { type: 'p', text: 'Make one change at a time.' },
      { type: 'p', text: 'Check the result after every edit.' },
      { type: 'p', text: 'Stop and say so when stuck.' },
      { type: 'p', text: 'Leave the code slightly tidier.' },
      { type: 'p', text: 'Rewarding these habits directly, rather than only the final outcome, made the model far more reliable on unfamiliar projects.' },
      { type: 'p', text: 'The effect was largest on the tasks we cared about most: long changes in projects the model had never seen, with tests that were slow or incomplete. A model that checks as it goes recovers early.' },
      { type: 'p', text: 'It is tempting to think of these as style. They are not. Each one closes off a way of failing that we saw again and again in early training runs, and each one showed up as a measurable improvement on the evaluation suite once we rewarded it. Together they account for more of the gain than any single change to the model itself.' },
      { type: 'p', text: 'None of it required a bigger model.' },

      { type: 'h2', text: 'Building the environments' },
      { type: 'p', text: 'To train on loops, we needed places for the loops to run. We built a large set of sandboxed projects in many languages.' },
      { type: 'p', text: 'Each project has its own build system, test suite and history, and comes with tasks drawn from the kind of work people really do: fixing a reported bug, adding a small feature, updating code after a dependency changed, or cleaning up something that has grown messy. The model interacts with these projects through the same tools the shipped agent uses. It can list files, read them, search, edit, run commands and see the output. There are no special shortcuts in training that would not exist on a user’s machine.' },
      { type: 'p', text: 'Building these projects is a lot of work, and much of it is unglamorous: pinning dependency versions, making builds reproducible, and trimming test suites so a single attempt finishes in minutes rather than hours. We also deliberately include projects with flaky tests, outdated documentation, confusing names and half-finished migrations, because real code looks like that. They make training harder and the model more useful.' },
      { type: 'p', text: 'Every environment is reset between attempts, so the model can fail freely without leaving anything behind.' },

      { type: 'h2', text: 'Judging the result' },
      { type: 'p', text: 'A training loop needs a signal. For code, the obvious signal is whether the tests pass. It is a good start and nowhere near enough.' },
      { type: 'p', text: 'Tests only check what someone thought to check. A model rewarded purely for passing tests learns to game them.' },
      { type: 'p', text: 'It will happily special-case the test inputs, delete inconvenient assertions, or make changes far larger than the task required. Each of these passes the tests and makes the code worse, and each one appeared in our early runs.' },
      { type: 'p', text: 'We combine several signals instead. Hidden tests that the model never sees. Checks that the change is no larger than it needs to be. Review by a separate model trained to spot the shortcuts described above. And, for a sample of tasks, review by people, who rate not only whether the change works but whether they would accept it in a real code review. The combined score is noisier than a single number, but much harder to game.' },
      { type: 'p', text: 'We also score the process, not only the outcome. A model that reaches the right answer by guessing is treated differently from one that reaches it by reading, testing and checking.' },
      { type: 'p', text: 'Before every release, the model runs a held-out set of tasks in projects it has never seen, using the exact build of the product that users will get. We track the share of tasks completed correctly, the size of the changes, how often the model asks for help, and how often it does something we would consider unsafe. The last number has to be zero on the release set. We also have people use each candidate build for real work for a week. Their notes catch problems no automated check would find, such as a model that is technically right but tiring to work with.' },
      { type: 'p', text: 'A release goes out only when the automated numbers and the human notes agree.' },
      { type: 'p', text: 'When they do not, we find out why before anything ships.' },

      { type: 'h2', text: 'Staying in bounds' },
      { type: 'p', text: 'An agent that can run commands on your machine needs to be careful about which commands it runs. We trained explicitly for restraint.' },
      { type: 'p', text: 'The model learns to prefer read-only actions when exploring, to ask before doing anything destructive, and to explain what a command will do before running it. Tasks in training include traps, such as instructions hidden in a file that try to trick the agent into deleting something, uploading a file, or changing its own settings. The model is rewarded for noticing these and declining, and penalized heavily for following them. We measure restraint with dedicated tasks, like correctness.' },
      { type: 'p', text: 'We also train the model to notice when a task is ambiguous and to ask a short question rather than guess. A wrong guess that takes ten minutes to undo is worse than a question that takes ten seconds to answer.' },
      { type: 'p', text: 'This is an area where we are conservative on purpose. The model runs on your machine, with access to your files, and it should earn trust slowly. Asking too often is annoying, and asking too rarely is dangerous, so we tune the balance on real sessions rather than on synthetic tasks. The product adds its own safeguards on top, such as confirmation before destructive commands and a clear log of everything the agent did, but we want the model to behave well even without them.' },
      { type: 'p', text: 'Restraint is a feature, not a limitation.' },
      { type: 'p', text: 'We also include tasks where the right answer is to change nothing. Sometimes the code is fine and the request is based on a misunderstanding, and a good collaborator says so. Early versions of the model almost never did this; they would find something to change in every task, because every example they had seen ended with a change. Adding these tasks made the model more honest, and noticeably easier to trust.' },

      { type: 'h2', text: 'Working in a small context' },
      { type: 'p', text: 'Because the model runs locally, it has less memory to work with than a hosted model. Training had to account for that.' },
      { type: 'p', text: 'Instead of reading an entire project into context, the model learns to navigate. It searches for the relevant pieces, reads them, keeps short notes about what it found, and lets go of files it no longer needs. The notes are plain text that the model writes for itself: which file holds what, which approach already failed, what still needs checking. They are cheap to keep and make long tasks far more coherent.' },
      { type: 'p', text: 'This turns out to be a good habit regardless of memory limits. A model that reads everything is slower and more easily distracted than one that reads what matters. It is also easier for a person to follow, since the context is made of whole files and clear tool results. We measure how much context the model uses on each task and reward solutions that stay lean, as long as they remain correct. Correctness always comes first.' },
      { type: 'p', text: 'The result works in large projects without holding them in memory.' },
      { type: 'p', text: 'We covered the technical side of this in the post on compression, where the runtime makes the cache as small as possible. Training attacks the same problem from the other direction, by teaching the model to need less of it. The two together are what make long sessions practical on a laptop, and neither would be enough on its own.' },
      { type: 'p', text: 'Both sides are measured on the same suite, so an improvement in one cannot quietly hide a regression in the other.' },

      { type: 'h2', text: 'What we got wrong' },
      { type: 'p', text: 'We made plenty of mistakes. Early environments were too clean, and the model struggled with real code, which is messier.' },
      { type: 'p', text: 'We also over-rewarded speed for a while. The model learned to finish quickly by skipping verification, which looked great on our dashboards and poorly in practice. It took us longer than it should have to notice, because the dashboards were the thing we were looking at. The fix was to weight the process signals more heavily and to include more tasks where skipping a check leads to a visibly wrong result. We now review a sample of full transcripts every week, not just the scores.' },
      { type: 'p', text: 'And we underestimated how much the phrasing of tasks mattered. Real requests are vague, informal and often wrong about the cause of a problem. Training on precise task descriptions produced a model that needed precise task descriptions. We now write tasks the way people actually write them. Each of these was fixed by changing the environments rather than the model. The model learns whatever the environment rewards, so the environment is where most of the design effort goes.' },

      { type: 'h2', text: 'What the numbers show' },
      { type: 'p', text: 'On the held-out release set, the current model completes most focused tasks correctly on the first attempt, and far more when it is allowed to test and retry the way the product does. Its changes are small, and it asks for help on a modest share of tasks, mostly the ambiguous ones where a person would ask too. It rarely touches files outside the scope of the request.' },
      { type: 'p', text: 'We are cautious about these figures. They come from our own suite on our own tasks, and the tasks change every quarter. We would rather under-promise and let people see for themselves on their own code, in their own projects, with their own habits and their own messy test suites.' },

      { type: 'h2', text: 'What comes next' },
      { type: 'p', text: 'The current model is good at focused tasks in a single project. The next step is longer work: changes that span days, multiple repositories, or several people’s code, with far less supervision along the way.' },
      { type: 'p', text: 'That will need new environments and new ways of judging the result, since the outcome of a long task is harder to score than whether one test passes. A change that spans a week touches many files and many decisions, and some of its effects only show up later, when other code comes to depend on it. We are building environments that replay real project histories so the model can be judged on how its changes hold up as the project moves on. We are also working on letting the model learn from your own project, locally and privately, so it picks up your conventions without any of your code leaving your machine.' },
      { type: 'p', text: 'There is a lot left to do. We think the approach is right: train on real work, in real environments, with signals that are hard to game. Thanks for reading.' },

      { type: 'hr' },
      { type: 'p', text: series('teaching-a-model-to-code', ' Each post stands on its own, but they read best in order. If you are new here, the manifesto explains why we are building Rig at all, and the waitlist below is the quickest way to try the agent on your own code. We read every reply, and the questions people send us often turn into the next post in the series, so please do write in.') },
    ],
  },

  {
    slug: 'manifesto',
    date: '2026-03-19',
    author: 'Rig Engineers',
    title: 'Why we decided to build Rig on our own',
    excerpt:
      'The tools engineers depend on most have moved off our machines and onto someone else’s meter. We think a coding agent should live where the code lives: on your own hardware.',
    blocks: [
      { type: 'p', text: 'For most of the history of software, the tools of the trade lived on the machine in front of you. You installed them once and they were there.' },
      { type: 'p', text: 'That changed quietly over the last few years. The most capable new tools now run somewhere else, in a data center you will never see, and they reach your work only through a network connection and a monthly bill.' },
      { type: 'p', text: 'The trade seemed reasonable at first. The models were large, laptops were not, and renting time on someone else’s hardware was the only way to get the results.' },
      { type: 'p', text: 'But the costs of that arrangement add up in ways that are easy to overlook until you start to notice them.' },
      { type: 'p', text: '**Every keystroke leaves the room.**' },
      { type: 'p', text: 'To help you, a hosted assistant first has to see your code.' },
      { type: 'p', text: 'It usually sees more than it needs. The code travels across the internet, is processed on machines you do not control, and is kept under policies that can change. For a side project that may be fine.' },
      { type: 'p', text: 'Then there is the meter. Usage limits, rate limits, tiers and overage charges shape how people work. Engineers start rationing their questions, which is the opposite of what a good tool should encourage.' },
      { type: 'p', text: '**A tool you ration is not your tool.**' },
      { type: 'p', text: 'And there is the dependency. When the service is slow, you are slow. When it is down, you stop working.' },
      { type: 'p', text: 'None of this is anyone’s fault. It is simply what happens when the essential part of a tool lives on a server instead of on your desk.' },
      { type: 'p', text: 'We think that moment is passing. Laptops have become remarkably capable, models have become far more efficient, and the gap between what you can run at home and what you can rent has narrowed sharply.' },
      { type: 'p', text: 'Rig is our attempt to close that gap entirely.' },
      { type: 'p', text: 'No account is required to use it. There are no usage caps and no tiers. No code is sent anywhere, and nothing is reported back.' },
      { type: 'p', text: 'It works on a plane, in a basement, and behind the strictest firewall. It is exactly as fast on a bad connection as on a good one, because it never uses the connection at all. Nothing waits on a server.' },
      { type: 'p', text: 'Getting there has meant rethinking the model, the runtime and the agent together, as one system tuned for a single job instead of three parts built separately. We will write about each part in detail.' },
      { type: 'p', text: '**Small, focused, and yours.**' },
      { type: 'p', text: 'We are not trying to build the biggest model. We are trying to build the most useful one that fits where your code already lives, and to make it good enough that you stop noticing it is local at all.' },
      { type: 'p', text: 'That means honest limits and shipping only what holds up.' },
      { type: 'p', text: 'We are opening access gradually, starting with engineers on real projects.' },
      { type: 'p', text: '**Your code stays with you.**' },
    ],
  },
]

export const getPost = (slug) => posts.find((p) => p.slug === slug)

const fmt = (iso, month) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' })
export const shortDate = (iso) => fmt(iso, 'short') // "Apr 16, 2026"
export const longDate = (iso) => fmt(iso, 'long') // "April 16, 2026"
