'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function NameEditor({ memberId, currentName }: { memberId: string; currentName: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from('members').update({ full_name: name.trim() }).eq('id', memberId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-xs text-moss-400 underline">
        Not your name? Edit
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-moss-100 rounded-lg px-2 py-1 text-sm"
      />
      <button onClick={save} disabled={saving} className="text-xs bg-moss-600 text-parchment rounded-full px-3 py-1">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}