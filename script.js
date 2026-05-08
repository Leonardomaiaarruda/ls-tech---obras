const API_URL = "https://script.google.com/macros/s/AKfycbxDYc3zZMgehcAwtVRbCUOqUjd4Ctem8i0W0f6iyFogFf02_Y9huXyiPNQInv1qSlUJ/exec";

async function carregarLista() {
    const div = document.getElementById('lista-funcionarios');
    try {
        const res = await fetch(`${API_URL}?tipo=faltas`);
        const texto = await res.text(); 
        const funcionarios = JSON.parse(texto);
        
        // Atualizado para incluir a tag <img> com a foto vinda da planilha
        div.innerHTML = funcionarios.map(f => `
            <div class="item-funcionario" style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <img src="${f.foto}" alt="Foto de ${f.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #27ae60;">
                <div style="flex-grow: 1;">
                    <input type="checkbox" id="${f.name}" value="${f.name}" style="transform: scale(1.2); margin-right: 8px;">
                    <label for="${f.name}" style="font-weight: bold; cursor: pointer;">${f.name}</label>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro capturado:", err);
        div.innerHTML = "Erro de conexão ao carregar funcionários.";
    }
}

async function enviarFaltas() {
    const selecionados = Array.from(document.querySelectorAll('input:checked')).map(i => i.value);
    const status = document.getElementById('status-msg');
    const btn = document.querySelector('button');

    if (selecionados.length === 0) return alert("Selecione os funcionários que faltaram.");

    btn.disabled = true;
    status.innerText = "Registrando faltas...";

    try {
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", 
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                sistema: 'faltas', 
                faltas: selecionados 
            })
        });

        status.style.color = "green";
        status.innerText = "Faltas registradas com sucesso!";
        document.querySelectorAll('input:checked').forEach(c => c.checked = false);
        
    } catch (err) {
        status.style.color = "red";
        status.innerText = "Erro ao enviar dados.";
        console.error(err);
    } finally {
        btn.disabled = false;
    }
}

async function verEquipe(nomeObra) {
    const listaEquipe = document.getElementById('lista-equipe');
    listaEquipe.innerHTML = "Carregando...";

    try {
        const res = await fetch(`${API_URL}?tipo=verEquipe&obra=${encodeURIComponent(nomeObra)}`);
        if (!res.ok) throw new Error("Erro na resposta do servidor");
        const equipe = await res.json();

        if (equipe.length === 0) {
            listaEquipe.innerHTML = "<li>Nenhum funcionário alocado nesta obra.</li>";
        } else {
            listaEquipe.innerHTML = equipe.map(nome => `<li>${nome}</li>`).join('');
        }
    } catch (error) {
        console.error("Erro detalhado:", error);
        listaEquipe.innerHTML = "<li>Erro ao carregar equipe.</li>";
    }
}

async function cadastrarObra() {
    const inputObra = document.getElementById('nome-obra-nova');
    const nomeObra = inputObra.value.trim();

    if (!nomeObra) return alert("Por favor, digite o nome da obra.");

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                sistema: 'criar_obra',
                nomeObra: nomeObra
            })
        });

        alert("Obra cadastrada com sucesso!");
        inputObra.value = ""; 
        carregarObras(); 
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao conectar com o servidor.");
    }
}

async function carregarObras() {
    const lista = document.getElementById('lista-obras-cadastradas');
    if(!lista) return;

    try {
        const res = await fetch(`${API_URL}?tipo=obras`);
        const obras = await res.json();
        lista.innerHTML = obras.map(obra => `<li>${obra}</li>`).join('');
    } catch (error) {
        lista.innerHTML = "Erro ao carregar obras.";
    }
}

// Carregamento inicial
window.onload = () => {
    carregarObras();
    carregarLista();
};