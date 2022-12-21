'use strict'

/**
 * FedThreader <https://github.com/wittman/fedthreader>
 * Copyright (C) 2022 Micah Wittman <https://wittman.org/>
 */

class Parser {
	paginationAppendSize = 6; //can accomodate: ` 99/99`
	urlPlaceholderToken = '__ejlxfsjlodlfvnjvqaj__'; // 23 characters long
	inputUrls = [];

	constructor(text, chunkSize, paginationMarker, isUrlConsideredStaticSize) {
		this.text = text;
		this.chunkSize = chunkSize;
		this.paginationMarker = paginationMarker;
		this.isUrlConsideredStaticSize = isUrlConsideredStaticSize;
	}

	chunk(text, chunkSize) {
		let wordsOversizeCount = 0;
		let struct = { output: '', wordsOversizeCount: 0 };
		if (!text || text.trim() === '') {
			return struct;
		}
		const effectiveChunkSize = chunkSize - this.paginationAppendSize;
		// Replace 4+ new lines with just 3
		let input = text.trim().replace(/\n{4,}/g, "\n\n\n");
		const hardbreak = '❡';
		// Replace with 2 blank lines with paragraph symbol
		input = text.trim().replace(/\n\n\n/g, ` ${hardbreak} `);
		input = input.split(' ');
		let [index, output] = [0, []];
		output[index] = '';
		input.forEach(word => {
			let temp = word !== hardbreak ? `${output[index]} ${word}`.trim() : output[index].trim();
			if (temp.length <= effectiveChunkSize || word === hardbreak) {
				output[index] = temp.replace(hardbreak, '');
				if (word === hardbreak) {
					index++;
					output[index] = '';
				}
			} else {
				index++;
				if (word.length > chunkSize) {
					wordsOversizeCount++;
				}
				output[index] = word;
			}
		});

		return { output: output, wordsOversizeCount: wordsOversizeCount };
	}

	setListenersCopyButtons(dom) {
		const buttons = document.querySelectorAll(dom.selectors.buttonOutputCopy);
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				const id = button.id.split('-')[1];
				const text = document.getElementById(id).innerHTML.replace(/<br>/g, "\n");
				let textDecoded = document.createElement("textarea");
				textDecoded.innerHTML = text;
				this.setClipboard(textDecoded.value);
				button.innerHTML = '✅ Copied!';
				button.classList.add('dim');
				button.disabled = true;
			});
		});
	}

	setClipboard(text) {
		navigator.clipboard.writeText(text)
	}

	tokensToUrls(text) {
		this.inputUrls.forEach(url => {
			text = text.replace(this.urlPlaceholderToken, url);
		});
		return text;
	}
	urlsToTokens(text) {
		const matches = text.match(/https:\/\/[^\s]+/g);
		this.inputUrls = matches ?? [];
		return text.replace(/https:\/\/[^\s]+/g, this.urlPlaceholderToken);
	}

	outputStruct() {
		let struct = {
			html: '',
			chunkCount: 0,
			wordsOversizeCount: 0,
		};

		const text = this.isUrlConsideredStaticSize ? this.urlsToTokens(this.text) : this.text;
		const chunksStruct = this.chunk(text, this.chunkSize);
		let chunks = chunksStruct.output;
		struct.wordsOversizeCount = chunksStruct.wordsOversizeCount;

		if (chunks === '') {
			return struct;
		}

		chunks = chunks.filter(paragraph => paragraph.trim() !== '');
		const partsCount = chunks.length ?? 0;
		struct.chunkCount = partsCount;

		const paginationItems = chunks.map((paragraph, index) => {
			const pagination = `${index + 1}/${partsCount}`;
			let page;
			switch (this.paginationMarker) {
				case 'append':
					page = `${paragraph} ${pagination}`; // trailing last line
					break;
				case 'prepend':
					page = `${pagination}\n${paragraph}`; // on new line
					break;
				default:
					page = paragraph; //no marker added
			}

			return `
			<h3>${pagination}</h3>
			<div class="pagination-item">	
				<div id="${index + 1}" class="textarea">${page.replace(/\n/g, '<br>')}</div>
				<div class="button-output-copy-wrap">
					<button id="button-${index + 1}" class="button-output-copy">Copy</button>
				</div>
			</div>
			\n\n`
		}).join('');

		let html = `<div class="pagination-items-wrap">
				${paginationItems}
			</div>`;

		if (this.isUrlConsideredStaticSize) {
			html = this.tokensToUrls(html);
		}
		struct.html = html;

		return struct;
	}
}

class Threader {
	static run(dom, text, chunkSize, paginationMarker, isUrlConsideredStaticSize) {
		const parser = new Parser(text, chunkSize, paginationMarker, isUrlConsideredStaticSize);

		const outputStruct = parser.outputStruct();
		if (outputStruct.wordsOversizeCount > 0) {
			dom.flashMessage.innerHTML =
				`<div class="flash-message-error">
					<h4>Error:</h4>
					<p>There is <strong>${outputStruct.wordsOversizeCount} word(s)</strong><br>
					(string of characters with no space)<br>
					<strong>over</strong> the post limit of <strong>(${chunkSize})</strong>.</p>
				</div>`;
		} else {
			dom.flashMessage.innerHTML = '';
		}

		dom.output.innerHTML = outputStruct.html;
		dom.chunkCount.innerHTML = outputStruct.chunkCount ? outputStruct.chunkCount.toString() : '';

		parser.setListenersCopyButtons(dom);

	}
	static save(key, value) {
		if (typeof value !== 'string') {
			console.error('save parameter not string type.');
			return;
		}
		localStorage.setItem(key, value);
	}
	static load(key) {
		return localStorage.getItem(key) ?? null;
	}
	static clear(dom) {
		dom.input.innerHTML = '';
		localStorage.clear('input');
	}

	static resetCopyButtons(dom) {
		const buttons = document.querySelectorAll(dom.selectors.buttonOutputCopy);
		buttons.forEach(button => {
			button.innerHTML = 'Copy';
			button.classList.remove('dim');
			button.disabled = false;
		});
	}
}

window.onload = () => {
	const dom = {
		selectors: {
			buttonOutputCopy: '.button-output-copy',
		},
		configureInputChunkSize: document.getElementById('configure-chunksize'),
		configureSelectPaginationMarker: document.getElementById('configure-pagination-marker'),
		configureIsUrlConsideredStaticSize: document.getElementById('configure-is-url-considered-static-size'),

		input: document.getElementById('input'),
		output: document.getElementById('output'),
		buttonClear: document.getElementById('button-clear'),
		chunkCount: document.getElementById('chunk-count'),
		flashMessage: document.getElementById('flash-messages'),
		buttonInputCollapse: document.getElementById('button-input-collapse'),
		buttonCopyButtonsReset: document.getElementById('button-copy-buttons-reset'),
	};


	const collapseHtml = '▸ <small>COLLAPSE</small>';
	const expandHtml = '▸ <small>EXPAND</small>';

	let global = {
		isFirstRun: true
	};

	let chunkSize;
	let paginationMarker;

	function toValidInt(value) {
		value = parseInt(value, 10);
		if (isNaN(value)) {
			return -1;
		}
		return value;
	}

	function isArrowKey(key) {
		const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
		return arrowKeys.includes(key);
	}

	function run() {
		console.log('run');

		const chunkSizeDefault = 500;
		const urlStaticSize = 23;
		const paginationMarkerDefault = 'append';

		let input;
		let chunkSize;
		let paginationMarker;
		let isUrlConsideredStaticSize;

		function setChunkSize() {
			if (chunkSize === -1 && (dom.configureInputChunkSize.value ?? '').trim() !== '') {
				chunkSize = chunkSizeDefault;
				setTimeout(() => {
					dom.configureInputChunkSize.value = 500
				}, 900);
			}
		}

		if (global.isFirstRun) {
			chunkSize = toValidInt(Threader.load('configure-chunk-size'), chunkSizeDefault);
			setChunkSize();

			paginationMarker = Threader.load('configure-pagination-marker') ?? paginationMarkerDefault;
			dom.configureSelectPaginationMarker.value = paginationMarker;

			isUrlConsideredStaticSize = Threader.load('configure-is-url-considered-static-size') === 'Y' ? true : false;
			dom.configureIsUrlConsideredStaticSize.checked = isUrlConsideredStaticSize;

			input = Threader.load('input') ?? '';
		} else {
			chunkSize = toValidInt(dom.configureInputChunkSize.value);
			setChunkSize();
			Threader.save('configure-chunk-size', chunkSize.toString());

			paginationMarker = dom.configureSelectPaginationMarker.value ?? paginationMarkerDefault;
			Threader.save('configure-pagination-marker', paginationMarker);

			isUrlConsideredStaticSize = dom.configureIsUrlConsideredStaticSize.checked;
			Threader.save('configure-is-url-considered-static-size', isUrlConsideredStaticSize ? 'Y' : '');

			input = dom.input.value;
			Threader.save('input', input);
		}

		dom.input.innerHTML = input;

		Threader.run(dom, input, chunkSize, paginationMarker, isUrlConsideredStaticSize);
		Threader.save('input', dom.input.value);

		resizeTextareaInput();
		global.isFirstRun = false;
	}

	function clear(dom) {
		if (confirm('Delete the text you have typed in?')) {
			Threader.clear(dom);
			dom.input.value = '';
			dom.output.innerHTML = '';
		}
	}

	function resizeTextareaInput() {
		dom.input.style.height = 'auto';
		dom.input.style.height = dom.input.scrollHeight + 'px';
	}

	const runMethodsOnChange = ['input', 'configureInputChunkSize',
		'configureSelectPaginationMarker', 'configureIsUrlConsideredStaticSize'];
	runMethodsOnChange.forEach(element => {
		dom[element].addEventListener('change', run);
	});

	dom.configureInputChunkSize.addEventListener('keyup', (e) => {
		if (isArrowKey(e.key)) {
			return;
		}
		run();
	});

	dom.input.addEventListener('keyup', (e) => {
		if (isArrowKey(e.key)) {
			return;
		}
		setTimeout(() => {
			// Delay so if there's a user keyboard combo to
			// select all inside the textarea isn't interferred with
			run();
			resizeTextareaInput();
		}, 900);
	});

	dom.input.addEventListener('focus', (e) => {
		resizeTextareaInput();
		dom.buttonInputCollapse.innerHTML = collapseHtml;
	});

	dom.buttonClear.addEventListener('click', () => clear(dom));

	dom.buttonInputCollapse.addEventListener('click', () => {
		if (dom.input.style.height === '30px') {
			resizeTextareaInput();
			dom.buttonInputCollapse.innerHTML = collapseHtml;
		} else {
			dom.input.style.height = '30px';
			dom.buttonInputCollapse.innerHTML = expandHtml;
		}
	});

	dom.buttonCopyButtonsReset.addEventListener('click', () => Threader.resetCopyButtons(dom));

	// Run on load
	run();

}
