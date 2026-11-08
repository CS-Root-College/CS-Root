const API_BASE_URL = "http://localhost:5000/api";

const $ = selector => document.querySelector(selector);

const subjectsBox = $("#subjects");
const chapterBox = $("#chapters");
const notesBox = $("#notes");
const tocBox = $("#toc");
const breadcrumb = $("#breadcrumb");
const contentScroll = $("#content-scroll");

const state = {
  subjects: [],
  chapters: [],
  currentSubject: null,
  currentTopic: null,
  observer: null
};

async function api(endpoint) {
  const response = await fetch(API_BASE_URL + endpoint);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

function message(text) {
  notesBox.replaceChildren();
  const p = document.createElement("p");
  p.className = "message";
  p.textContent = text;
  notesBox.append(p);
}

function updateURL(subjectId, topicId = "") {
  const url = new URL(location.href);
  url.searchParams.set("subject", subjectId);

  if (topicId) url.searchParams.set("topic", topicId);
  else url.searchParams.delete("topic");

  history.pushState({}, "", url);
}

function renderSubjects() {
  subjectsBox.replaceChildren();

  state.subjects.forEach(subject => {
    const link = document.createElement("a");
    link.href = `?subject=${encodeURIComponent(subject.id)}`;
    link.textContent = subject.name;

    const isActive = String(subject.id) === String(state.currentSubject?.id);
    link.classList.toggle("active", isActive);

    link.addEventListener("click", event => {
      event.preventDefault();
      if (state.currentSubject?.id !== subject.id) {
        loadSubject(subject.id, true);
      }
    });

    subjectsBox.append(link);
  });
}

async function loadSubjects() {
  message("Loading subjects...");

  try {
    state.subjects = await api("/subjects");

    if (!Array.isArray(state.subjects) || !state.subjects.length) {
      message("No subjects available.");
      return;
    }

    const params = new URLSearchParams(location.search);
    const requestedSubjectId = params.get("subject");
    const requestedTopicId = params.get("topic") || "";

    const selected = state.subjects.find(
      subject => String(subject.id) === String(requestedSubjectId)
    ) || state.subjects[0];

    await loadSubject(selected.id, false, requestedTopicId);
  } catch (error) {
    console.error(error);
    message("Unable to load subjects. Please check your API connection.");
  }
}

async function loadSubject(subjectId, updateHistory = true, topicId = "") {
  const subject = state.subjects.find(
    item => String(item.id) === String(subjectId)
  );

  if (!subject) return;

  state.currentSubject = subject;
  state.currentTopic = null;
  state.chapters = [];

  const subjectTitleEl = $("#subject-title");
  if (subjectTitleEl) subjectTitleEl.textContent = subject.name;

  chapterBox.replaceChildren();
  tocBox.replaceChildren();

  renderSubjects();
  message("Loading chapters...");

  if (updateHistory) updateURL(subject.id);

  try {
    state.chapters = await api(
      `/subjects/${encodeURIComponent(subject.id)}/chapters`
    );

    if (!Array.isArray(state.chapters)) {
      throw new Error("Invalid chapters response");
    }

    const chapterPromises = state.chapters.map(chapter =>
      api(`/chapters/${encodeURIComponent(chapter.id)}/topics`)
        .then(topics => ({ ...chapter, topics }))
        .catch(() => ({ ...chapter, topics: [] }))
    );

    state.chapters = await Promise.all(chapterPromises);

    renderChapters();

    const allTopics = state.chapters.flatMap(chapter =>
      (chapter.topics || []).map(topic => ({
        ...topic,
        chapterId: chapter.id,
        chapterName: chapter.name
      }))
    );

    const selectedTopic = allTopics.find(
      topic => String(topic.id) === String(topicId)
    ) || allTopics[0];

    if (selectedTopic) {
      await openTopic(selectedTopic.id, updateHistory && !!topicId);
    } else {
      breadcrumb.textContent = subject.name;
      message("No topics available in this subject.");
    }
  } catch (error) {
    console.error(error);
    message("Unable to load chapters. Please try again.");
  }
}

function renderChapters() {
  chapterBox.replaceChildren();

  state.chapters.forEach(chapter => {
    const group = document.createElement("div");
    group.className = "chapter-group";

    const button = document.createElement("button");
    button.className = "chapter-title";
    button.type = "button";
    button.textContent = chapter.name;
    button.setAttribute("aria-expanded", "false");

    const subtopics = document.createElement("div");
    subtopics.className = "subtopics";

    button.addEventListener("click", () => {
      group.classList.toggle("open");
      button.setAttribute(
        "aria-expanded",
        group.classList.contains("open")
      );
    });

    (chapter.topics || []).forEach(topic => {
      const link = document.createElement("a");
      link.className = "subtopic";
      link.href = `?subject=${encodeURIComponent(state.currentSubject.id)}&topic=${encodeURIComponent(topic.id)}`;
      link.textContent = topic.name;
      link.dataset.id = topic.id;

      link.addEventListener("click", event => {
        event.preventDefault();
        openTopic(topic.id, true);
      });

      subtopics.append(link);
    });

    group.append(button, subtopics);
    chapterBox.append(group);
  });
}

function renderInline(node, parent) {
  if (node.type === "hardBreak") {
    parent.append(document.createElement("br"));
    return;
  }

  if (node.type !== "text") {
    (node.content || []).forEach(child =>
      renderInline(child, parent)
    );
    return;
  }

  let element = document.createTextNode(node.text || "");

  const tags = {
    bold: "strong",
    italic: "em",
    code: "code",
    strike: "s",
    underline: "u",
    link: "a",
    highlight: "mark",
    subscript: "sub",
    superscript: "sup"
  };

  (node.marks || []).forEach(mark => {
    const tag = tags[mark.type];
    if (!tag) return;

    const wrapper = document.createElement(tag);

    if (mark.type === "link") {
      const href = mark.attrs?.href || "#";
      try {
        const url = new URL(href, location.origin);
        if (["http:", "https:", "mailto:"].includes(url.protocol)) {
          wrapper.href = href;
        }
      } catch {
        wrapper.href = "#";
      }
      wrapper.rel = "noopener noreferrer";
      wrapper.target = mark.attrs?.target || "_self";
    }

    if (mark.type === "highlight" && mark.attrs?.color) {
      wrapper.style.backgroundColor = mark.attrs.color;
    }

    wrapper.append(element);
    element = wrapper;
  });

  parent.append(element);
}

function getText(node) {
  if (node.type === "text") return node.text || "";
  return (node.content || []).map(getText).join("");
}

function renderNode(node, parent) {
  const tags = {
    paragraph: "p",
    bulletList: "ul",
    orderedList: "ol",
    listItem: "li",
    blockquote: "blockquote",
    tableRow: "tr",
    tableCell: "td",
    tableHeader: "th"
  };

  if (node.type === "text" || node.type === "hardBreak") {
    renderInline(node, parent);
    return;
  }

  let element;

  if (node.type === "heading") {
    const level = Math.min(6, Math.max(1, node.attrs?.level || 2));
    element = document.createElement("h" + level);
    element.id = `section-${tocBox.children.length}`;

    if (level >= 2 && level <= 4) {
      const link = document.createElement("a");
      link.href = "#" + element.id;
      link.textContent = getText(node) || "Section";

      link.addEventListener("click", event => {
        event.preventDefault();
        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

      tocBox.append(link);
    }
  } else if (node.type === "image") {
    if (!node.attrs?.src) return;
    element = document.createElement("img");
    element.src = node.attrs.src;
    element.alt = node.attrs.alt || "";
    element.loading = "lazy";
    element.decoding = "async";
    if (node.attrs.title) element.title = node.attrs.title;
    if (node.attrs.width) element.style.width = node.attrs.width + "px";
  } else if (node.type === "horizontalRule") {
    element = document.createElement("hr");
  } else if (node.type === "codeBlock") {
    element = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = getText(node);
    if (node.attrs?.language) {
      code.className = "language-" + node.attrs.language;
    }
    element.append(code);
  } else if (node.type === "table") {
    element = document.createElement("table");
    const body = document.createElement("tbody");
    (node.content || []).forEach(child => renderNode(child, body));
    element.append(body);
    parent.append(element);
    return;
  } else {
    const tag = tags[node.type];
    if (!tag) return;
    element = document.createElement(tag);
    if (node.attrs?.colspan) element.colSpan = node.attrs.colspan;
    if (node.attrs?.rowspan) element.rowSpan = node.attrs.rowspan;
  }

  (node.content || []).forEach(child => renderNode(child, element));
  parent.append(element);
}

function updateMenu(topicId) {
  document.querySelectorAll(".chapter-group").forEach(group => {
    const links = [...group.querySelectorAll(".subtopic")];
    const active = links.some(link => link.dataset.id === String(topicId));

    group.classList.toggle("open", active);

    const button = group.querySelector(".chapter-title");
    if (button) {
      button.classList.toggle("active", active);
      button.setAttribute("aria-expanded", active);
    }

    links.forEach(link => {
      link.classList.toggle("active", link.dataset.id === String(topicId));
    });
  });
}

function updateTOCObserver() {
  state.observer?.disconnect();
  const headings = notesBox.querySelectorAll("h2,h3,h4");
  if (!headings.length) return;

  state.observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (!visible) return;

    tocBox.querySelectorAll("a").forEach(link => {
      link.classList.toggle("active", link.hash === "#" + visible.target.id);
    });
  }, {
    root: contentScroll,
    rootMargin: "-10% 0px -75% 0px"
  });

  headings.forEach(heading => state.observer.observe(heading));
}

function updateProgress() {
  const maxScroll = contentScroll.scrollHeight - contentScroll.clientHeight;
  const percent = maxScroll > 0
    ? Math.min(100, Math.round((contentScroll.scrollTop / maxScroll) * 100))
    : 100;

  const progressEl = $("#progress");
  const progressTextEl = $("#progress-text");
  if (progressEl) progressEl.style.width = percent + "%";
  if (progressTextEl) progressTextEl.textContent = percent + "% completed";
}

async function openTopic(topicId, updateHistory = true) {
  const topic = state.chapters
    .flatMap(chapter =>
      (chapter.topics || []).map(item => ({
        ...item,
        chapterId: chapter.id,
        chapterName: chapter.name
      }))
    )
    .find(item => String(item.id) === String(topicId));

  if (!topic) return;

  state.currentTopic = topic;
  message("Loading notes...");
  tocBox.replaceChildren();

  if (updateHistory) {
    updateURL(state.currentSubject.id, topic.id);
  }

  try {
    const data = await api(`/topics/${encodeURIComponent(topic.id)}`);

    notesBox.replaceChildren();

    const title = document.createElement("h1");
    title.textContent = data.title || topic.name;
    notesBox.append(title);

    const contentData = data.content?.content || data.content;

    if (typeof contentData === "string") {
      const container = document.createElement("div");
      container.innerHTML = contentData;
      notesBox.append(container);
    } else if (Array.isArray(contentData)) {
      contentData.forEach(node => renderNode(node, notesBox));
    }

    breadcrumb.textContent =
      `${state.currentSubject.name} / ${topic.chapterName} / ${data.title || topic.name}`;

    document.title = `${data.title || topic.name} | CSRoot`;

    updateMenu(topic.id);
    updateTOCObserver();

    contentScroll.scrollTop = 0;
    updateProgress();
  } catch (error) {
    console.error(error);
    message("Unable to load notes. Please try again.");
  }
}

contentScroll.addEventListener("scroll", updateProgress, { passive: true });

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  const subjectId = params.get("subject");
  const topicId = params.get("topic") || "";

  if (subjectId) {
    loadSubject(subjectId, false, topicId);
  }
});

loadSubjects();