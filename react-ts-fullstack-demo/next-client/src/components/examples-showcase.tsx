'use client';

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside the toast provider');
  return notify;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const notify = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, kind }]);
  }, []);

  const currentToast = toasts[0];
  useEffect(() => {
    if (!currentToast) return;
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== currentToast.id));
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [currentToast]);

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 top-4 z-50 w-[min(22rem,calc(100vw-2rem))]" aria-live="polite" aria-relevant="additions">
        {currentToast && (
          <div
            key={currentToast.id}
            className={`flex items-start justify-between gap-4 rounded-2xl border bg-white p-4 shadow-xl ${
              currentToast.kind === 'error' ? 'border-red-200' : currentToast.kind === 'success' ? 'border-emerald-200' : 'border-stone-200'
            }`}
            role={currentToast.kind === 'error' ? 'alert' : 'status'}
          >
            <p className="text-sm">{currentToast.message}</p>
            <button className="text-stone-500 hover:text-stone-900" aria-label="Dismiss notification" onClick={() => dismiss(currentToast.id)}>×</button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

interface CommentNode {
  id: string;
  author: string;
  body: string;
  replies: CommentNode[];
}

const initialComments: CommentNode[] = [
  {
    id: 'comment-1',
    author: 'Maya Chen',
    body: 'Breaking a large feature into small, reviewable pieces made this much easier to ship.',
    replies: [
      {
        id: 'comment-1-1',
        author: 'Noah Williams',
        body: 'Agreed. It also makes it easier to spot where state belongs.',
        replies: [],
      },
    ],
  },
  {
    id: 'comment-2',
    author: 'Avery Patel',
    body: 'Stable IDs are important here: list positions can change when a reply is added or removed.',
    replies: [],
  },
];

function addNestedReply(comments: CommentNode[], parentId: string, reply: CommentNode): CommentNode[] {
  const index = comments.findIndex((comment) => comment.id === parentId);
  if (index >= 0) {
    return comments.map((comment, itemIndex) => itemIndex === index
      ? { ...comment, replies: [...comment.replies, reply] }
      : comment);
  }

  for (let index = 0; index < comments.length; index += 1) {
    const updatedReplies = addNestedReply(comments[index].replies, parentId, reply);
    if (updatedReplies !== comments[index].replies) {
      return comments.map((comment, itemIndex) => itemIndex === index
        ? { ...comment, replies: updatedReplies }
        : comment);
    }
  }

  return comments;
}

const CommentItem = memo(function CommentItem({
  comment,
  depth,
  onReply,
}: {
  comment: CommentNode;
  depth: number;
  onReply: (parentId: string, body: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState('');

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onReply(comment.id, draft.trim());
    setDraft('');
    setReplying(false);
  }

  return (
    <li className="mt-4" style={{ marginLeft: Math.min(depth, 4) * 12 }}>
      <article className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-semibold text-emerald-900">{comment.author}</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">{comment.body}</p>
        <button className="mt-3 text-xs font-medium text-emerald-800 underline underline-offset-2" onClick={() => setReplying((value) => !value)}>
          {replying ? 'Cancel' : 'Reply'}
        </button>
        {replying && (
          <form className="mt-3 flex gap-2" onSubmit={submitReply}>
            <label className="sr-only" htmlFor={`reply-${comment.id}`}>Write a reply</label>
            <input id={`reply-${comment.id}`} className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply..." />
            <button className="rounded-lg bg-emerald-900 px-3 py-2 text-xs font-medium text-white" type="submit">Post</button>
          </form>
        )}
      </article>
      {comment.replies.length > 0 && (
        <ul className="border-l border-stone-200 pl-3">
          {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />)}
        </ul>
      )}
    </li>
  );
});

interface TableRecord {
  id: number;
  name: string;
  team: string;
  status: 'Active' | 'Invited' | 'Inactive';
  updated: string;
}

const records: TableRecord[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: ['Alex Morgan', 'Sam Rivera', 'Jamie Lee', 'Taylor Kim', 'Riley Jordan', 'Casey Singh'][index % 6],
  team: ['Design', 'Engineering', 'Product'][index % 3],
  status: (['Active', 'Invited', 'Inactive'] as const)[index % 3],
  updated: `2026-10-${String(28 - (index % 20)).padStart(2, '0')}`,
}));

type SortKey = 'name' | 'team' | 'status';

const accordionItems = [
  { title: 'What does optimistic UI mean?', body: 'The interface reflects the expected result immediately, while the request runs in the background. If the request fails, the previous state is restored.' },
  { title: 'Why use stable list keys?', body: 'A stable ID lets React associate each rendered row with the same data item after sorting, filtering, insertion, or deletion.' },
  { title: 'When should filtering happen on the server?', body: 'Use server-side filtering and pagination when data is too large to download or when permissions and authoritative query rules belong on the API.' },
];

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-800">INTERACTIVE EXAMPLE</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ExamplesContent() {
  const notify = useToast();
  const [comments, setComments] = useState(initialComments);
  const commentId = useRef(2);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('Components');
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [likePending, setLikePending] = useState(false);
  const [forceLikeFailure, setForceLikeFailure] = useState(false);
  const [messages, setMessages] = useState<{ id: number; author: string; text: string; mine: boolean }[]>([
    { id: 1, author: 'Morgan', text: 'Hey! The new examples page is ready to review.', mine: false },
  ]);
  const [chatDraft, setChatDraft] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const incomingMessages = useRef<{ id: number; author: string; text: string; mine: boolean }[]>([]);
  const chatTimers = useRef<number[]>([]);
  const nextMessageId = useRef(1);
  const [throttleCooldown, setThrottleCooldown] = useState(false);
  const throttleTimer = useRef<number | null>(null);
  const [allowMultipleOpen, setAllowMultipleOpen] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]);

  useEffect(() => {
    const timer = window.setTimeout(() => setChatLoading(false), 350);
    const poller = window.setInterval(() => {
      if (incomingMessages.current.length === 0) return;
      const received = incomingMessages.current.splice(0);
      setMessages((current) => [...current, ...received]);
      setRemoteTyping(false);
    }, 700);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(poller);
      chatTimers.current.forEach(window.clearTimeout);
      if (throttleTimer.current !== null) window.clearTimeout(throttleTimer.current);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, remoteTyping]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return records
      .filter((record) => statusFilter === 'All' || record.status === statusFilter)
      .filter((record) => !normalizedSearch || `${record.name} ${record.team} ${record.status}`.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => {
        const order = left[sortKey].localeCompare(right[sortKey]);
        return sortAscending ? order : -order;
      });
  }, [search, sortAscending, sortKey, statusFilter]);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((tablePage - 1) * pageSize, tablePage * pageSize);

  function postReply(parentId: string, body: string) {
    const id = `comment-${++commentId.current}`;
    setComments((current) => addNestedReply(current, parentId, { id, author: 'You', body, replies: [] }));
    notify('Reply added to the thread.', 'success');
  }

  function changeSort(key: SortKey) {
    if (sortKey === key) setSortAscending((current) => !current);
    else {
      setSortKey(key);
      setSortAscending(true);
    }
    setTablePage(1);
  }

  async function handleLike() {
    if (likePending) return;
    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;
    setLiked(nextLiked);
    setLikeCount(previousCount + (nextLiked ? 1 : -1));
    setLikePending(true);
    try {
      await new Promise<void>((resolve, reject) => {
        window.setTimeout(() => forceLikeFailure ? reject(new Error('The demo request failed.')) : resolve(), 650);
      });
      notify(nextLiked ? 'Added to favorites.' : 'Removed from favorites.', 'success');
    } catch (requestError) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      notify(requestError instanceof Error ? requestError.message : 'Could not update favorite.', 'error');
    } finally {
      setLikePending(false);
    }
  }

  function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    const id = ++nextMessageId.current;
    setMessages((current) => [...current, { id, author: 'You', text, mine: true }]);
    setChatDraft('');
    setRemoteTyping(true);
    const timer = window.setTimeout(() => {
      incomingMessages.current.push({
        id: ++nextMessageId.current,
        author: 'Morgan',
        text: 'Thanks for the message! This reply was delivered by the local polling demo.',
        mine: false,
      });
    }, 1600);
    chatTimers.current.push(timer);
  }

  function runThrottledAction() {
    if (throttleTimer.current !== null) return;
    setThrottleCooldown(true);
    notify('Action accepted. Further clicks are paused briefly.', 'info');
    throttleTimer.current = window.setTimeout(() => {
      setThrottleCooldown(false);
      throttleTimer.current = null;
    }, 1600);
  }

  function toggleAccordion(index: number) {
    setOpenAccordions((current) => {
      if (allowMultipleOpen) {
        return current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      }
      return current.includes(index) ? [] : [index];
    });
  }

  const navigation = [
    { label: 'Toast queue', href: '#toasts' },
    { label: 'Nested comments', href: '#comments' },
    { label: 'Responsive sidebar', href: '#sidebar-demo' },
    { label: 'Animated tabs', href: '#tabs' },
    { label: 'Data table', href: '#data-table' },
    { label: 'Optimistic favorite', href: '#optimistic-like' },
    { label: 'Polling chat', href: '#chat' },
    { label: 'Rate-limited button', href: '#throttle' },
    { label: 'Accordion', href: '#accordion' },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#f7f7f2]/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a className="font-semibold tracking-tight text-stone-900" href="/">Fullstack UI Lab</a>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm text-stone-600 hover:text-emerald-900 sm:inline" href="/">Todo app</a>
            <button className="rounded-lg border border-stone-300 px-3 py-2 text-sm lg:hidden" aria-expanded={mobileNavOpen} aria-controls="examples-nav" onClick={() => setMobileNavOpen((open) => !open)}>
              {mobileNavOpen ? 'Close menu' : 'Examples'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-8 lg:py-12">
        <aside
          id="examples-nav"
          className={`${mobileNavOpen ? 'block' : 'hidden'} fixed inset-x-4 top-[4.5rem] z-20 max-h-[75vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-xl lg:sticky lg:top-24 lg:block lg:h-fit lg:max-h-[calc(100vh-7rem)] lg:w-60 lg:shrink-0 lg:rounded-2xl lg:shadow-sm`}
        >
          <button className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold" aria-expanded={openSubmenu === 'Components'} onClick={() => setOpenSubmenu((current) => current === 'Components' ? null : 'Components')}>
            Components <span aria-hidden="true">{openSubmenu === 'Components' ? '−' : '+'}</span>
          </button>
          {openSubmenu === 'Components' && (
            <nav aria-label="Example sections" className="mt-2 space-y-1">
              {navigation.map((item) => (
                <a key={item.href} className="block rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-emerald-50 hover:text-emerald-950" href={item.href} onClick={() => setMobileNavOpen(false)}>{item.label}</a>
              ))}
            </nav>
          )}
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <section className="pb-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-800">REACT + TYPESCRIPT PATTERNS</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Nine practical UI examples.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">Interactive patterns for common product features. These examples use local demo data where an API or real-time service would normally be connected.</p>
          </section>

          <Section id="toasts" title="Queued toast notifications" description="A small Context-backed notification service queues messages and displays one at a time. Each toast owns and cleans up its timeout; errors use an alert role.">
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white" onClick={() => notify('Your changes have been saved.', 'success')}>Success toast</button>
              <button className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-800" onClick={() => notify('Something needs your attention.', 'error')}>Error toast</button>
              <button className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium" onClick={() => { notify('First queued notification.', 'info'); notify('Second queued notification.', 'info'); notify('Third queued notification.', 'info'); }}>Queue three</button>
            </div>
          </Section>

          <Section id="comments" title="Recursive comment thread" description="Comments own child replies and render through a memoized recursive component. Replies get stable IDs, and updates replace only objects along the changed branch.">
            <ul>
              {comments.map((comment) => <CommentItem key={comment.id} comment={comment} depth={0} onReply={postReply} />)}
            </ul>
          </Section>

          <Section id="sidebar-demo" title="Responsive sidebar navigation" description="On wide screens the navigation stays in a sticky sidebar; on small screens it becomes a toggleable menu. Submenus use button state and links scroll to real sections.">
            <div className="rounded-2xl bg-stone-50 p-4 sm:p-6">
              <p className="text-sm font-semibold">Try the “Examples” menu at the top on a narrow screen.</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">The sidebar also has a collapsible Components submenu, keyboard-accessible buttons, and links that close the mobile menu after selection.</p>
            </div>
          </Section>

          <Section id="tabs" title="Animated, data-driven tabs" description="Tab labels and content are modeled as data. A single selected ID drives the active tab and a lightweight CSS transition animates the panel.">
            {(() => {
              const tabs = [
                { id: 'overview', label: 'Overview', text: 'Keep tab configuration in a typed array and store only the selected tab ID.' },
                { id: 'accessibility', label: 'Accessibility', text: 'Use tablist, tab, and tabpanel roles with aria-selected and linked IDs.' },
                { id: 'motion', label: 'Motion', text: 'A CSS keyframe is enough for a simple fade/slide; use a motion library when transitions need orchestration.' },
              ];
              const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
              function moveTabFocus(event: KeyboardEvent<HTMLDivElement>) {
                const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                let nextIndex = currentIndex;
                if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
                else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                else if (event.key === 'Home') nextIndex = 0;
                else if (event.key === 'End') nextIndex = tabs.length - 1;
                else return;
                event.preventDefault();
                setActiveTab(tabs[nextIndex].id);
                document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
              }
              return (
                <>
                  <div className="flex flex-wrap gap-2 border-b border-stone-200" role="tablist" aria-label="Tab example" onKeyDown={moveTabFocus}>
                    {tabs.map((tab) => (
                      <button key={tab.id} id={`tab-${tab.id}`} className={`border-b-2 px-4 py-3 text-sm font-medium ${activeTab === tab.id ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-stone-500'}`} role="tab" tabIndex={activeTab === tab.id ? 0 : -1} aria-selected={activeTab === tab.id} aria-controls="example-tab-panel" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                  </div>
                  <div key={selectedTab.id} id="example-tab-panel" className="tab-panel-enter min-h-24 py-5 text-sm leading-6 text-stone-700" role="tabpanel" aria-labelledby={`tab-${selectedTab.id}`} tabIndex={0}>{selectedTab.text}</div>
                </>
              );
            })()}
          </Section>

          <Section id="data-table" title="Filterable, sortable data table" description="This small dataset is filtered and sorted client-side, then paginated. For large datasets, move these query parameters to an API and fetch only the current page.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1 text-sm font-medium">
                Search
                <input className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 font-normal" value={search} onChange={(event) => { setSearch(event.target.value); setTablePage(1); }} placeholder="Name, team, or status" />
              </label>
              <label className="text-sm font-medium">
                Status
                <select className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setTablePage(1); }}>
                  {['All', 'Active', 'Invited', 'Inactive'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {(['name', 'team', 'status'] as const).map((key) => (
                      <th key={key} className="px-4 py-3 font-semibold capitalize">
                        <button className="hover:text-emerald-800" onClick={() => changeSort(key)}>{key} {sortKey === key ? (sortAscending ? '↑' : '↓') : ''}</button>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visibleRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3">{record.name}</td>
                      <td className="px-4 py-3">{record.team}</td>
                      <td className="px-4 py-3">{record.status}</td>
                      <td className="px-4 py-3 text-stone-500">{record.updated}</td>
                    </tr>
                  ))}
                  {visibleRecords.length === 0 && <tr><td className="px-4 py-8 text-center text-stone-500" colSpan={4}>No matching records.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm">
              <span className="text-stone-500">{filteredRecords.length} results · Page {tablePage} of {pageCount}</span>
              <div className="flex gap-2">
                <button className="rounded-lg border border-stone-300 px-3 py-2 disabled:opacity-40" disabled={tablePage <= 1} onClick={() => setTablePage((page) => page - 1)}>Previous</button>
                <button className="rounded-lg border border-stone-300 px-3 py-2 disabled:opacity-40" disabled={tablePage >= pageCount} onClick={() => setTablePage((page) => page + 1)}>Next</button>
              </div>
            </div>
          </Section>

          <Section id="optimistic-like" title="Optimistic favorite with rollback" description="The count and button state update immediately. A simulated request either confirms the change or restores the previous state; toggle failure to try the rollback path.">
            <div className="flex flex-wrap items-center gap-4">
              <button className={`rounded-full border px-5 py-3 font-medium transition ${liked ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-stone-300 bg-white'}`} aria-pressed={liked} disabled={likePending} onClick={handleLike}>
                {liked ? '♥ Liked' : '♡ Like'} · {likeCount}
              </button>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={forceLikeFailure} onChange={(event) => setForceLikeFailure(event.target.checked)} />
                Simulate API failure
              </label>
              {likePending && <span className="text-sm text-stone-500" role="status">Saving…</span>}
            </div>
          </Section>

          <Section id="chat" title="Polling chat with typing state" description="The demo polls a local message queue on an interval and shows loading and typing states. Swap the polling adapter for WebSocket events when the backend supports persistent real-time connections.">
            <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="h-64 space-y-3 overflow-y-auto rounded-xl bg-white p-4" aria-label="Chat messages" aria-live="polite">
                {chatLoading ? <p className="text-sm text-stone-500">Loading conversation…</p> : messages.map((message) => (
                  <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${message.mine ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-800'}`}>
                      {!message.mine && <p className="mb-1 text-[11px] font-semibold">{message.author}</p>}
                      <p className="text-sm leading-5">{message.text}</p>
                    </div>
                  </div>
                ))}
                {remoteTyping && <p className="text-xs text-stone-500" role="status">Morgan is typing…</p>}
                <div ref={chatEndRef} />
              </div>
              <form className="mt-3 flex gap-2" onSubmit={sendChatMessage}>
                <label className="sr-only" htmlFor="chat-message">Message</label>
                <input id="chat-message" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Write a message..." />
                <button className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white" type="submit">Send</button>
              </form>
            </div>
          </Section>

          <Section id="throttle" title="Click throttling" description="A small leading-edge cooldown accepts the first click and ignores rapid repeats. Debounce is better for waiting until typing stops; throttle is useful for repeated actions.">
            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={throttleCooldown} onClick={runThrottledAction}>
                {throttleCooldown ? 'Please wait…' : 'Run rate-limited action'}
              </button>
              <span className="text-sm text-stone-500">One accepted action per 1.6 seconds.</span>
            </div>
          </Section>

          <Section id="accordion" title="Configurable accordion" description="The selected section IDs live in state. Turn on multiple-open mode or keep a single section expanded; the panel transition respects reduced-motion preferences.">
            <label className="mb-4 flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={allowMultipleOpen} onChange={(event) => { setAllowMultipleOpen(event.target.checked); setOpenAccordions((current) => current.slice(0, 1)); }} />
              Allow multiple sections open
            </label>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {accordionItems.map((item, index) => {
                const isOpen = openAccordions.includes(index);
                return (
                  <div key={item.title}>
                    <h3>
                      <button className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold" aria-expanded={isOpen} aria-controls={`accordion-panel-${index}`} onClick={() => toggleAccordion(index)}>
                        {item.title}<span aria-hidden="true" className="text-lg text-emerald-800">{isOpen ? '−' : '+'}</span>
                      </button>
                    </h3>
                    <div id={`accordion-panel-${index}`} className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!isOpen}>
                      <div className="overflow-hidden">
                        <p className="pb-4 pr-8 text-sm leading-6 text-stone-600">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <footer className="flex flex-wrap justify-between gap-3 border-t border-stone-200 py-6 text-xs tracking-wide text-stone-500">
            <a className="underline underline-offset-2 hover:text-emerald-900" href="/">Return to Todo app</a>
            <span>BUILT WITH REACT, TYPESCRIPT & TAILWIND</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default function ExamplesShowcase() {
  return (
    <ToastProvider>
      <ExamplesContent />
    </ToastProvider>
  );
}
