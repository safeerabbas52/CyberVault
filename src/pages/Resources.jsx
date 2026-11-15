import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, inp, btn, card } from '../db';

export default function Resources({ admin }) {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ title: '', desc: '', link: '' });

  const load = async () => {
    const snap = await getDocs(collection(db, 'resources'));
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  const add = async e => {
    e.preventDefault();
    if (!f.title.trim() || !f.link.trim()) return;
    const url = f.link.startsWith('http') ? f.link : `https://${f.link}`;
    await addDoc(collection(db, 'resources'), {
      title: f.title.trim(),
      desc: f.desc.trim(),
      link: url,
      createdAt: serverTimestamp()
    });
    setF({ title: '', desc: '', link: '' });
    load();
  };

  const del = async id => {
    if (!confirm('Delete this resource?')) return;
    await deleteDoc(doc(db, 'resources', id));
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Resources & Documentation</h1>
      <p className="text-sm text-slate-400">Reference guides, credentials, and materials for your tasks.</p>

      {admin && (
        <form onSubmit={add} className={card + ' grid md:grid-cols-3 gap-2'}>
          <input
            className={inp}
            placeholder="Resource title"
            value={f.title}
            onChange={e => setF({ ...f, title: e.target.value })}
            required
          />
          <input
            className={inp}
            placeholder="URL (e.g., https://docs.google.com/...)"
            value={f.link}
            onChange={e => setF({ ...f, link: e.target.value })}
            required
          />
          <button className={btn}>Add resource</button>
          <input
            className={inp + ' md:col-span-3'}
            placeholder="Short description"
            value={f.desc}
            onChange={e => setF({ ...f, desc: e.target.value })}
          />
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {list.map(res => (
          <div key={res.id} className={card + ' space-y-2 hover:border-cyan-500/50 transition flex flex-col justify-between'}>
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-white">{res.title}</h3>
                {admin && (
                  <button onClick={() => del(res.id)} className="text-xs text-red-400 hover:underline shrink-0">
                    Delete
                  </button>
                )}
              </div>
              {res.desc && <p className="text-xs text-slate-300 leading-relaxed mt-1">{res.desc}</p>}
            </div>
            <a href={res.link} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:underline inline-block pt-2">
              Access resource →
            </a>
          </div>
        ))}
        {!list.length && <p className="text-sm text-slate-400">No resources added yet.</p>}
      </div>
    </div>
  );
}