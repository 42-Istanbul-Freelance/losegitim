#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../docs/agent_plan');

if (!fs.existsSync(dir)) {
	console.log("❌ docs/agent_plan klasörü bulunamadı.");
	process.exit(1);
}

const files = fs.readdirSync(dir)
	.filter(f => /^0\d{2}_.*\.md$/.test(f))
	.sort();

let nextTask = null;

for (const file of files) {
	const filePath = path.join(dir, file);
	const content = fs.readFileSync(filePath, 'utf-8');
	if (!content.includes('[TAMAMLANDI]')) {
		nextTask = file;
		break;
	}
}

if (nextTask) {
	console.log(`\n🚀 Sıradaki göreve başlıyoruz.`);
	console.log(`Lütfen AI asistanına şu promptu yapıştırın:\n`);
	console.log(`Sıradaki göreve başlıyoruz. Lütfen docs/agent_plan/${nextTask} dosyasını oku ve işleme başla.\n`);
} else {
	console.log(`\n🎉 Harika! Tüm görevler [TAMAMLANDI] veya planlanmış yeni bir görev yok.\n`);
}
