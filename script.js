const questionsContainer = document.querySelector('.questions');
const productListContainer = document.getElementById('product-list');

let products = [];
let questions = [];

let currentStep = 0;
let selectedQuestions = [];
let currentIndex = 0;

let stepCounterContainer;

async function fetchData() {
    try {
        const questionsResponse = await fetch('./data/question.json');
        const productsResponse = await fetch('./data/products.json');

        questions = await questionsResponse.json();
        products = await productsResponse.json();

        displayQuestions(questions);

    } catch (error) {
        console.error("Error:", error);

    }
}

function displayQuestions(questions) {
    questionsContainer.innerHTML = "";

    const questionSet = questions.find(q => q.steps);

    const step = questionSet.steps.find(s => parseInt(s.step) === parseInt(currentStep));

    const colorMap = { "siyah": "#000000", "bej": "#F5F5DC", "beyaz": "#FFFFFF", "mavi": "#0000FF", "kırmızı": "#FF0000", "yeşil": "#008000" };

    if (!step) {
        const card = document.createElement("div");
        let loader = document.createElement("label");
        loader.classList.add("loading");
        loader.innerHTML = "Loading...";
        card.appendChild(loader);
        questionsContainer.appendChild(card);
        setTimeout(() => {
            filterProducts();
            card.remove();
        }, 300);
        return;
    }
    const card = document.createElement("div");
    const label = document.createElement('label');
    card.appendChild(label);

    if (step.type === "question") {
        label.innerHTML = `<p>${step.title}</p>`;

        step.answers.forEach(answer => {
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.classList.add("answer-button");

            button.dataset.value = answer;
            button.textContent = answer;
            button.onclick = function () { checkSelectedQuestions(answer); };

            card.appendChild(button);
        });
    } else if (step.type === "color") {

        label.innerHTML = `<p>${step.title}</p>`;

        step.answers.forEach(answer => {
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.classList.add("color-button");

            button.style.backgroundColor = colorMap[answer];

            button.dataset.value = answer;
            button.textContent = "";
            button.onclick = function () { checkSelectedQuestions(answer); };

            card.appendChild(button);
        });

    } else if (step.type === "price") {
        label.innerHTML = `<p>${step.title}</p>`;

        step.answers.forEach(answer => {
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.classList.add("answer-button");

            button.dataset.value = answer;
            button.textContent = answer + "₺";
            button.onclick = function () { checkSelectedQuestions(answer); };

            card.appendChild(button);
        });
    }

    questionsContainer.appendChild(card);

    const navContainer = document.createElement("div");
    navContainer.classList.add("nav-container");

    const backButton = document.createElement('div');
    backButton.innerHTML = `<button type="button" class="arrow-button"> < </button><br><span >Back</span>`;
    backButton.disabled = currentStep === 0;
    backButton.onclick = function () {
        if (currentStep > 0) {
            currentStep--;
            displayQuestions(questions);
        }
    };

    const nextButton = document.createElement('div');
    nextButton.innerHTML = `<button type="button" class="arrow-button"> > </button><br><span >Next</span>`;
    nextButton.onclick = function () {
        if (isStepSelected()) {
            currentStep++;
            displayQuestions(questions);
        }
    };

    navContainer.appendChild(backButton);
    navContainer.appendChild(nextButton);
    card.appendChild(navContainer);
    questionsContainer.appendChild(card);
}

function checkSelectedQuestions(answer) {
    const buttons = document.querySelectorAll('.answer-button');
    buttons.forEach(button => button.classList.remove('selected'));

    buttons.forEach(button => {
        if (button.textContent.trim() === answer) {
            button.classList.add('selected');
        }
    });

    selectedQuestions[currentStep] = answer;
}

function isStepSelected() {
    return selectedQuestions[currentStep] !== undefined;
}

function filterProducts() {
    let selectedCategories = selectedQuestions;

    let filteredProducts = products.filter(product => {
        let productColor = String(product.colors).toLowerCase();;
        let productGender = String(product.gender).toLowerCase();
        let productPrice = product.price;

        let matchedCategory = selectedCategories.some(category => String(category).toLowerCase() === productColor);
        let genderMatched = selectedCategories.some(category => String(category).toLowerCase() === productGender);
        let priceMatched = selectedCategories.some(category => {
            if (category.includes('-')) {
                let [minPrice, maxPrice] = category.split('-').map(Number);
                return productPrice >= minPrice && productPrice <= maxPrice;
            } else {
                return false;
            }
        });
        return matchedCategory && genderMatched && priceMatched;
    });
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    productListContainer.innerHTML = "";

    if (products.length === 0) {
        productListContainer.innerHTML = "<p>No Product Found</p>";
        return;
    }

    let container = document.createElement("div");
    container.classList.add("container");

    let prevBtn = document.createElement("button");
    prevBtn.classList.add("pre-btn");
    prevBtn.innerHTML = "<";
    prevBtn.onclick = () => { showSlide(-1); }
    productListContainer.appendChild(prevBtn);

    let nextBtn = document.createElement("button");
    nextBtn.classList.add("nxt-btn");
    nextBtn.innerHTML = ">";
    nextBtn.onclick = () => showSlide(1);
    productListContainer.appendChild(nextBtn);

    products.forEach((product) => {

        let productCard = document.createElement("div");
        productCard.classList.add("productCard");
        container.appendChild(productCard);

        let pictureCard = document.createElement("div");
        pictureCard.classList.add("pictureCard");
        let image = document.createElement("img");
        image.setAttribute("src", product.image);
        image.setAttribute("loading", "lazy");
        pictureCard.appendChild(image);
        productCard.appendChild(pictureCard);

        let productInfo = document.createElement("div");
        productInfo.classList.add("pictureCard");
        let name = document.createElement("h5");
        name.classList.add("name");
        name.innerText = product.name.toUpperCase();
        productInfo.appendChild(name);
        productCard.appendChild(productInfo);

        let priceOld = document.createElement("h6");
        priceOld.innerText = product.oldPrice ? product.oldPrice + "₺" : "";
        priceOld.classList.add("price-old");
        productInfo.appendChild(priceOld);

        let priceNew = document.createElement("h5");
        priceNew.innerText = product.price + "₺";
        priceNew.classList.add("price-new");
        productInfo.appendChild(priceNew);

        let viewProduct = document.createElement("button");
        viewProduct.classList.add("viewProduct");
        viewProduct.innerHTML = "VIEW PRODUCT";
        productInfo.appendChild(viewProduct);
    });
    productListContainer.appendChild(container);
    createStepCounter(products.length);
}

function createStepCounter(totalSteps) {
    if (!stepCounterContainer) {
        stepCounterContainer = document.createElement("div");
        stepCounterContainer.setAttribute("id", "step-counter");
        productListContainer.appendChild(stepCounterContainer);
    }

    stepCounterContainer.innerHTML = "";

    for (let i = 0; i < totalSteps; i++) {
        let stepLine = document.createElement("span");
        stepLine.classList.add("step-line");
        if (i === currentIndex) stepLine.classList.add("active");
        stepCounterContainer.appendChild(stepLine);
    }

    stepCounterContainer.style.display = "flex";
}

function showSlide(direction) {
    let container = document.querySelector(".container");
    let pictureCard = document.querySelector(".pictureCard ");

    if (!container || !pictureCard) return;

    let totalItems = container.children.length;
    let cardWidth = pictureCard.offsetWidth;

    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = totalItems - 1;
    } else if (currentIndex >= totalItems) {
        currentIndex = 0;
    }

    container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    createStepCounter(totalItems);
}

fetchData();


