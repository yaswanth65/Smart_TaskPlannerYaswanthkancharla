/**
 * Export utilities for plans
 */

export function exportPlanAsJSON(plan) {
  const dataStr = JSON.stringify(plan, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plan-${plan.goal.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPlanAsCSV(plan) {
  const rows = [
    ['Task Name', 'Status', 'Progress', 'Duration', 'Deadline', 'Depends On', 'Notes']
  ];

  plan.tasks.forEach(task => {
    rows.push([
      task.name || '',
      task.status || 'todo',
      (task.progress || 0) + '%',
      task.duration || '',
      task.deadline || '',
      (task.dependsOn || []).join('; '),
      task.notes || ''
    ]);
  });

  const csvContent = rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plan-${plan.goal.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPlanAsMarkdown(plan) {
  let markdown = `# ${plan.goal}\n\n`;
  markdown += `Generated: ${new Date(plan.createdAt || Date.now()).toLocaleString()}\n\n`;

  if (plan.parseStatus) {
    markdown += `*AI Model: ${plan.aiModel || 'Unknown'} | Parse Status: ${plan.parseStatus}*\n\n`;
  }

  markdown += `## Tasks\n\n`;

  plan.tasks.forEach((task, idx) => {
    const status = task.status ? ` [${task.status.toUpperCase()}]` : '';
    const progress = task.progress !== undefined ? ` (${task.progress}%)` : '';
    markdown += `### ${idx + 1}. ${task.name}${status}${progress}\n\n`;
    
    if (task.duration) markdown += `- **Duration:** ${task.duration}\n`;
    if (task.deadline) markdown += `- **Deadline:** ${task.deadline}\n`;
    if (task.dependsOn && task.dependsOn.length > 0) {
      markdown += `- **Depends on:** ${task.dependsOn.join(', ')}\n`;
    }
    if (task.notes) markdown += `- **Notes:** ${task.notes}\n`;
    markdown += '\n';
  });

  const dataBlob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plan-${plan.goal.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export function copyPlanToClipboard(plan) {
  let text = `${plan.goal}\n\n`;
  plan.tasks.forEach((task, idx) => {
    text += `${idx + 1}. ${task.name}`;
    if (task.status) text += ` [${task.status}]`;
    if (task.duration) text += ` - ${task.duration}`;
    text += '\n';
    if (task.dependsOn && task.dependsOn.length > 0) {
      text += `   Depends on: ${task.dependsOn.join(', ')}\n`;
    }
    if (task.notes) {
      text += `   Notes: ${task.notes}\n`;
    }
  });

  navigator.clipboard.writeText(text).then(
    () => alert('Plan copied to clipboard!'),
    (err) => console.error('Could not copy text: ', err)
  );
}
