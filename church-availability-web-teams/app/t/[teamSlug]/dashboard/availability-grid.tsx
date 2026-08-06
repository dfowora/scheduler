'use client';

import { useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';
import type { Service, Availability, AvailabilityStatus } from '../../../../types/database';

const STATUS_OPTIONS: AvailabilityStatus[] = ['available', 'maybe', 'unavailable'];

export default function AvailabilityGrid({
  memberId,
  services,
  initialAvailability,
}: {
  memberId: string;
  services: Service[];
  initialAvailability: Availability[];
}) {
  const [statuses, setStatuses] = useState<Record<string, AvailabilityStatus>>(
    Object.fromEntries(initialAvailability.map((a) => [a.service_id, a.status]))
  );
  const supabase = createClient();

  const setStatus = async (serviceId: string, status: AvailabilityStatus) => {
    setStatuses((prev) => ({ ...prev, [serviceId]: status }));
    await supabase.from('availability').upsert(
      { member_id: memberId, service_id: serviceId, status, updated_at: new Date().toISOString() },
      { onConflict: 'member_id,service_id' }
    );
  };

  if (services.length === 0) {
    return <p className="text-moss-400">No upcoming services scheduled yet.</p>;
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div key={service.id} className="border border-moss-100 rounded-xl p-5 bg-white">
          <p className="text-xs text-moss-400 mb-1">
            {service.service_date} · {service.service_time}
          </p>
          <p className="font-display text-lg text-moss-900 mb-3">{service.title}</p>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((status) => {
              const active = statuses[service.id] === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatus(service.id, status)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                    active
                      ? 'bg-moss-600 text-parchment'
                      : 'bg-moss-50 text-moss-600 hover:bg-moss-100'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
