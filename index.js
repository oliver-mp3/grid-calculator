import "./style.css";

//If javascript was not loaded, the site won't load
document.getElementById("parent").style.setProperty("display", "flex")

const input = document.getElementById("input");
const fontChoiceButton = document.getElementById("font-choose");
const totalElement = document.getElementById("total");

const gridSizes = [...document.getElementsByClassName("grid-size")];
let selectedGridSize = gridSizes[0].children[1].innerText;

const widths = await fetch("/widths.json").then(e => e.json());
const fonts = await fetch("/fonts.json").then(e => e.json());	

const loadedFonts = new Set;
let selectedCategory = fonts[0].id;
let selectedFont = fonts[0].fonts[0][0];

function isUpperCase(letter) {
	if(typeof letter !== "string" || letter.length !== 1) throw new Error("The parameter needs to be a one letter string");

	return (letter.toUpperCase() === letter ? true : false);
}

function updateWidth() {
	input.value = input.value.replace(/[^a-zA-Z]+/g, "");

	let total = 0;
	let spaces = 0;

	input.value.split("").forEach(letter => {
		isUpperCase(letter)
			? total += widths[selectedCategory ?? "minecraft"][selectedFont ?? "ten"][letter.toLowerCase()][1]
			: total += widths[selectedCategory ?? "minecraft"][selectedFont ?? "ten"][letter.toLowerCase()][0]
	});

	[1, 0].includes(input.value.length) ? null : spaces += (input.value.length - 1);

	totalElement.innerText = (total == 0 && spaces == 0) ? "0" : ((total + spaces)*parseInt(selectedGridSize) - 1).toString();
}

input.addEventListener("input", updateWidth);

function showModal(title, content, func) {
	let modalId = title.replace(/[^a-z]/g, "");
	const dialog = document.createElement("dialog");
	dialog.classList.add("modal", "modal-bottom", "sm:modal-middle");
	dialog.setAttribute("id", modalId);
	dialog.innerHTML =
	`<form method="dialog" class="modal-box">
		<h3 class="font-bold text-xl text-white font-mcseven tracking-wide pb-5">${title}</h3>
		${content}
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>`

	document.documentElement.appendChild(dialog)
	dialog.showModal();
	
	if (func) {
		const modal = dialog.querySelector(".modal-box");
		func(modal, dialog);
	}
}

fontChoiceButton.addEventListener("click", (e) => {
	showModal("Choose font category",
	`<div class="grid grid-cols-2 gap-5">
	${fonts.map(e =>
		`<div class="font-card card image-full" data-category="${e.id}">
			<figure><img loading="lazy" src="/fonts/${e.id}/banner.png"></figure>
			<div class="card-body justify-center items-center">
				<h1 class="font-card-title">${e.name}</h1>
			</div>
		</div>`
	).join("")}
	</div>
	<div class="modal-action">
		<button class="btn rounded-none font-mcfive tracking-widest highlight relative focus:outline-none border-none m-5">Close</button>
	</div>`, (modal, dialog) => {
			modal.querySelector("button").addEventListener("click", dialog.close);
			modal.querySelectorAll(".font-card").forEach(e => e.addEventListener("click", event => {
				const category = fonts.find(e => e.id === event.currentTarget.dataset.category)
				for (const font of category.fonts) {
					const fontId = `${category.id}-${font[0]}`;
					if(loadedFonts.has(fontId)) continue;
					const style = document.getElementsByTagName("style")[0];
					style.innerHTML += `
						@font-face {
							font-family: ${fontId};
							src: url("/fonts/${category.id}/${font[0]}.ttf");
						}
					`

					document.documentElement.append(style);
					loadedFonts.add(fontId);
				}
				
				dialog.close();

				showModal("Choose font", `
					<div class="text-white gap-4 grid grid-cols-2 place-items-center font-select cursor-pointer">${category.fonts.map(e => `
						<div class="font${selectedCategory === category.id && selectedFont === e[0] ? " selected" : ""} ${!widths?.[category.id]?.[e[0]] ? "disabled" : ""}" data-font="${e[0]}">
							<div style="font-family:${category.id}-${e[0]}; font-size: ${e[2] + "rem" ?? "4rem"};">ABC</div>
						</div>
					`).join("")}</div>
					<div class="modal-action gap-3">
						<button id="back" class="underline text-gray-400 text-xl font-mcseven">Back</button>
						<button id="close" class="btn bg-green-bg text-white rounded-none font-mcfive tracking-widest highlight relative focus:outline-none border-none m-5">Close</button>
					</div>
				`, (modal2, dialog2) => {
					modal2.querySelector("#back").addEventListener("click", () => {
						dialog2.close();
						dialog.showModal();
					});
					modal2.querySelector("#close").addEventListener("click", () => {
						dialog.close();
						dialog2.close();
					});

					modal2.querySelectorAll(".font").forEach(e => e.addEventListener("click", (evt) => {
						const font = category.fonts.find(e => e[0] === evt.currentTarget.dataset.font);
						selectedCategory = category.id;
						selectedFont = font[0];

						document.querySelectorAll(".font-selected").forEach(e => e.classList.remove("font-selected"))
						evt.currentTarget.classList.add("font-selected");

						fontChoiceButton.innerText = `Selected Font: ${category.name} - ${font[1]}`;
						updateWidth();
					}));
				});
			}));
		}
	)
});

gridSizes.forEach(option => {
	option.addEventListener("click", e => {
		gridSizes.forEach(element => element.classList.remove("size-selected"));

		option.classList.add("size-selected");

		selectedGridSize = option.children[1].innerText;
		updateWidth();
	});
});