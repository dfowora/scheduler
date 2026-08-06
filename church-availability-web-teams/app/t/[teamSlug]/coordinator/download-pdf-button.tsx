'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Service, Assignment, Member } from '../../../../types/database';

type AssignmentWithMember = Assignment & { member: Member };

export default function DownloadPdfButton({
  teamName,
  services,
  assignments,
}: {
  teamName: string;
  services: Service[];
  assignments: AssignmentWithMember[];
}) {
  const download = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(58, 82, 51);
    doc.text(`${teamName} — Service Roster`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(130, 130, 130);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 24);

    const rows = services
      .slice()
      .sort((a, b) => a.service_date.localeCompare(b.service_date))
      .flatMap((service) => {
        const forService = assignments
          .filter((a) => a.service_id === service.id)
          .sort((a, b) => a.role.localeCompare(b.role));

        return forService.map((a) => [
          service.title,
          service.service_date,
          service.service_time,
          a.member.full_name,
          a.role,
        ]);
      });

    if (rows.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text('No assignments have been made yet.', 14, 34);
    } else {
      autoTable(doc, {
        startY: 30,
        head: [['Service', 'Date', 'Time', 'Assigned To', 'Role']],
        body: rows,
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [58, 82, 51], textColor: [251, 247, 237], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [238, 242, 237] },
        bodyStyles: { textColor: [32, 36, 31] },
        columnStyles: {
          4: { textColor: [184, 146, 46], fontStyle: 'bold' },
        },
      });
    }

    doc.save(
      `${teamName.toLowerCase().replace(/\s+/g, '-')}-roster-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <button
      onClick={download}
      className="text-sm bg-moss-900 text-parchment rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity"
    >
      Download roster PDF
    </button>
  );
}
