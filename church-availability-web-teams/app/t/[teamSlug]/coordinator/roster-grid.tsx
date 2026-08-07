'use client';

import { useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';
import type { Service, Availability, Member, Assignment, Roster } from '../../../../types/database';

type AvailabilityWithMember = Availability & { member: Member };
type AssignmentWithMember = Assignment & { member: Member };

export default function RosterGrid({
  rosters,
  services,
  availability,
  assignments,
}: {
  rosters: Roster[];
  services: Service[];
  availability: AvailabilityWithMember[];
  assignments: AssignmentWithMember[];
}) {
  const [assigned, setAssigned] = useState<AssignmentWithMember[]>(assignments);
  const [roleInputs, setRoleInputs] = useState<Record<string, string>>(
    Object.fromEntries(availability.map((a) => [a.id, a.preferred_role ?? '']))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoleValues, setEditRoleValues] = useState<Record<string, string>>({});
  const supabase = createClient();

  const statusFor = (serviceId: string, memberId: string) =>
    availability.find((a) => a.service_id === serviceId && a.member_id === memberId)?.status;

  const assign = async (serviceId: string, member: Member, availabilityId: string) => {
    const role = (roleInputs[availabilityId] || 'general').trim();

    await supabase
      .from('assignments')
      .upsert({ service_id: serviceId, member_id: member.id, role }, { onConflict: 'service_id,role' });

    setAssigned((prev) => [
      ...prev.filter((a) => !(a.service_id === serviceId && a.role === role)),
      {
        id: crypto.randomUUID(),
        service_id: serviceId,
        member_id: member.id,
        role,
        confirmed: false,
        created_at: new Date().toISOString(),
        member,
      },
    ]);
  };

  const startEdit = (assignment: AssignmentWithMember) => {
    setEditingId(assignment.id);
    setEditRoleValues((prev) => ({ ...prev, [assignment.id]: assignment.role }));
  };

  const saveRole = async (assignment: AssignmentWithMember) => {
    const newRole = (editRoleValues[assignment.id] || assignment.role).trim();
    await supabase.from('assignments').update({ role: newRole }).eq('id', assignment.id);
    setAssigned((prev) => prev.map((a) => (a.id === assignment.id ? { ...a, role: newRole } : a)));
    setEditingId(null);
  };

  const removeAssignment = async (assignment: AssignmentWithMember) => {
    await supabase.from('assignments').delete().eq('id', assignment.id);
    setAssigned((prev) => prev.filter((a) => a.id !== assignment.id));
  };

  const renderService = (service: Service) => {
    const responses = availability.filter((a) => a.service_id === service.id);
    const assignedForService = assigned.filter((a) => a.service_id === service.id);

    return (
      <section key={service.id} className="mb-8">
        <h3 className="font-display text-xl text-moss-900 mb-1">{service.title}</h3>
        <p className="text-xs text-moss-400 mb-4">
          {service.service_date} · {service.service_time}
        </p>

        {assignedForService.length > 0 && (
          <div className="mb-4 border border-gold/40 bg-gold/5 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gold mb-2">Assigned</p>
            <ul className="space-y-2">
              {assignedForService.map((a) => {
                const currentStatus = statusFor(a.service_id, a.member_id);
                const nowUnavailable = currentStatus === 'unavailable';
                const isEditing = editingId === a.id;

                return (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink truncate">{a.member.full_name}</span>
                        {nowUnavailable && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                            now unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <input
                            value={editRoleValues[a.id] ?? a.role}
                            onChange={(e) =>
                              setEditRoleValues((prev) => ({ ...prev, [a.id]: e.target.value }))
                            }
                            className="w-20 text-xs border border-moss-100 rounded-full px-2 py-1"
                          />
                          <button
                            onClick={() => saveRole(a)}
                            className="text-xs px-2 py-1 rounded-full bg-moss-600 text-parchment"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-moss-400 capitalize">{a.role}</span>
                          <button onClick={() => startEdit(a)} className="text-xs text-moss-600 underline">
                            Change
                          </button>
                        </>
                      )}
                      <button onClick={() => removeAssignment(a)} className="text-xs text-red-600 underline">
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {responses.length === 0 ? (
          <p className="text-sm text-moss-400">No responses yet.</p>
        ) : (
          <div className="border border-moss-100 rounded-xl overflow-hidden bg-white">
            {responses.map((r) => {
              const isAssigned = assigned.some(
                (a) => a.service_id === service.id && a.member_id === r.member_id
              );
              const isUnavailable = r.status === 'unavailable';

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-moss-100 last:border-b-0 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.member.full_name}</p>
                    <p className="text-xs text-moss-400 capitalize">{r.status}</p>
                  </div>

                  {isUnavailable ? (
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-moss-50 text-moss-400 shrink-0">
                      Unavailable
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        value={roleInputs[r.id] ?? ''}
                        onChange={(e) => setRoleInputs((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="role"
                        disabled={isAssigned}
                        className="w-24 text-xs border border-moss-100 rounded-full px-3 py-1.5 disabled:opacity-50"
                      />
                      <button
                        onClick={() => assign(service.id, r.member, r.id)}
                        disabled={isAssigned}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                          isAssigned ? 'bg-moss-50 text-moss-400' : 'bg-gold text-white hover:opacity-90'
                        }`}
                      >
                        {isAssigned ? 'Assigned' : 'Assign'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  if (rosters.length === 0 && services.length === 0) {
    return <p className="text-moss-400">No rosters yet — create one above to get started.</p>;
  }

  const ungrouped = services.filter((s) => !s.roster_id);

  return (
    <div className="space-y-10">
      {rosters.map((roster) => {
        const rosterServices = services.filter((s) => s.roster_id === roster.id);
        if (rosterServices.length === 0) return null;

        return (
          <div key={roster.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-2xl text-moss-900">{roster.name}</h2>
              <span className="text-xs text-moss-400">
                {rosterServices.length} service{rosterServices.length === 1 ? '' : 's'}
              </span>
            </div>
            {rosterServices.map(renderService)}
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-moss-900 mb-4">Ungrouped</h2>
          {ungrouped.map(renderService)}
        </div>
      )}
    </div>
  );
}