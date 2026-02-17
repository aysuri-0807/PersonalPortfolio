// Planetary system interactions: hover preview + modal open
document.addEventListener('DOMContentLoaded', function(){
	const planets = document.querySelectorAll('.planet');
	const preview = document.getElementById('planetPreview');
	const pTitle = document.getElementById('previewTitle');
	const pDesc = document.getElementById('previewDesc');
	const pLink = document.getElementById('previewLink');
	const modalEl = document.getElementById('projectModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalDesc = document.getElementById('modalDesc');
	const modalLink = document.getElementById('modalLink');
	const bsModal = new bootstrap.Modal(modalEl);

	planets.forEach(p => {
		// set r from parent orbit if present
		const orbit = p.parentElement;
		const r = getComputedStyle(orbit).getPropertyValue('--r') || '140px';
		p.style.setProperty('--r', r.trim());

		p.addEventListener('mouseenter', (e)=>{
			const t = p.dataset.title;
			const d = p.dataset.desc;
			const u = p.dataset.url;
			pTitle.textContent = t;
			pDesc.textContent = d;
			pLink.href = u;
			// position preview near top-right of container
			preview.style.display = 'block';
		});

		p.addEventListener('mouseleave', ()=>{
			preview.style.display = '';
		});

		p.addEventListener('click', ()=>{
			modalTitle.textContent = p.dataset.title;
			modalDesc.textContent = p.dataset.desc;
			modalLink.href = p.dataset.url;
			bsModal.show();
		});
	});

	// When modal shown, pause orbits; resume when hidden
	modalEl.addEventListener('show.bs.modal', ()=>{
		document.querySelectorAll('.orbit').forEach(o=> o.style.animationPlayState='paused');
	});
	modalEl.addEventListener('hidden.bs.modal', ()=>{
		document.querySelectorAll('.orbit').forEach(o=> o.style.animationPlayState='running');
	});
});
