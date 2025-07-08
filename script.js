let promtinput = document.querySelector(".promt-input");
let btnn = document.querySelector(".genrate-btn");
let promt_form = document.querySelector(".prmt-form");

const model = document.querySelector("#select-model");
const imagecount = document.querySelector("#image-count");
const aspectratio = document.querySelector("#aspect-ratio");
const galleryGrid = document.querySelector(".gallery-grid");

const API_KEY = "xxxxxxxxxxx";

function parseAspectRatio(aspectRatio, base = 512) {
    const [width_ratio, height_ratio] = aspectRatio.split('/').map(Number);
    
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width_ratio, height_ratio);
    
    const width = Math.round((base * width_ratio / divisor) / 64) * 64;
    const height = Math.round((base * height_ratio / divisor) / 64) * 64;
    
    return { width, height };
}

let update_image_card = (i_index,image_url) => {

    const image_card = document.getElementById(`img-card-${i_index}`);

    if(!image_card){
        return;
    }

    image_card.innerHTML = `
                        <img src="${image_url}" class="result-img" >

                        <div class="image-overlay">

                            <button class="img-download-btn">

                                <i class="fa-solid fa-download"></i>

                            </button>

                        </div>`;

}

let generate_image = async (modelname , image_count , aspect_ratio , promt_input) => {

    let model  = `https://router.huggingface.co/hf-inference/models/${modelname}`;
    const { width, height } = parseAspectRatio(aspect_ratio);

    console.log("got here");

    const image_promises = Array.from({length:image_count} , async(_,i) => {

        try {

            console.log("got here 2");

            const response = await fetch( model , {
    
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                        // "x-use-cache" : "false",
                    },
                    method: "POST",
                    body: JSON.stringify({
    
                        inputs : promt_input,
                        parameters: {
    
                            width: width,
                            height : height,
    
                        },
    
                    }),
                
    
            });
    
            if(!response.ok){
                throw new Error( (await response.json())?.error );
            }

            let result = await response.blob();
            let image_url = URL.createObjectURL(result);
            console.log(`Image ${i + 1} generated:`, result); 
            console.log(URL.createObjectURL(result));
            // window.open(URL.createObjectURL(result), "_blank"); 
            // return result;
            
            update_image_card(i,image_url);
    
        }catch(error) {
    
            console.log(error);
    
        }

    })

    await Promise.allSettled(image_promises);

}



let create_image_cards = (modelname , image_count , aspect_ratio , promt_input) => {

    galleryGrid.innerHTML = "";

    for(let i = 0;i<image_count;i++){

        galleryGrid.innerHTML +=`<div class="image-card"  id = "img-card-${i}" style = "aspect-ratio : ${aspect_ratio}" >



                                </div>`

  

    }

    generate_image(modelname , image_count , aspect_ratio , promt_input);

}


const handleformsubmit = (e) => {

    e.preventDefault();
    console.log("Form Submitted!");

    let modelname = model.value;
    let image_count = parseInt(imagecount.value) || 1;
    let aspect_ratio = aspectratio.value || "1/1";

    let promt_input = promtinput.value.trim();

    create_image_cards(modelname , image_count , aspect_ratio , promt_input);



}

promt_form.addEventListener("submit",handleformsubmit);


