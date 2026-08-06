'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import type { Service, Availability, Member, Assignment } from '../../types/database';

type AvailabilityWithMember = Availability & { member: Member };
type AssignmentWithMember = Assignment & { member: Member };

export default function RosterGrid({
  services,
  availability,
  assignments,
}: {
  services: Service[];
  availability: AvailabilityWithMember[];
  assignments: AssignmentWithMember[];
}) {
  const [assigned, setAssigned] = useState<AssignmentWithMember[]>(assignments);
  const supabase = createClient();

  const assign = async (serviceId: string, member: Member, role: string) => {
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

  if (services.length === 0) {
    return <p className="text-moss-400">No upcoming services to schedule yet.</p>;
  }

  return (
    <div className="space-y-8">
      {services.map((service) => {
        const responses = availability.filter((a) => a.service_id === service.id);
        const assignedForService = assigned.filter((a) => a.service_id === service.id);

        return (
          <section key={service.id}>
            <h2 className="font-display text-xl text-moss-900 mb-1">{service.title}</h2>
            <p className="text-xs text-moss-400 mb-4">
              {service.service_date} · {service.service_time}
            </p>

            {assignedForService.length > 0 && (
              <div className="mb-4 border border-gold/40 bg-gold/5 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gold mb-2">Assigned</p>
                <ul className="space-y-1">
                  {assignedForService.map((a) => (
                    <li key={a.id} className="text-sm text-ink flex justify-between">
                      <span>{a.member.full_name}</span>
                      <span className="text-moss-400 capitalize">{a.role}</span>
                    </li>
                  ))}
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
                      className="flex items-center justify-between px-4 py-3 border-b border-moss-100 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{r.member.full_name}</p>
                        <p className="text-xs text-moss-400 capitalize">{r.status}</p>
                      </div>

                      {isUnavailable ? (
                        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-moss-50 text-moss-400">
                          Unavailable
                        </span>
                      ) : (
                        <button
                          onClick={() => assign(service.id, r.member, r.preferred_role ?? 'general')}
                          disabled={isAssigned}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                            isAssigned
                              ? 'bg-moss-50 text-moss-400'
                              : 'bg-gold text-white hover:opacity-90'
                          }`}
                        >
                          {isAssigned ? 'Assigned' : 'Assign'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}