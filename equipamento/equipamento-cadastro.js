"use strict";

const API_URL = "https://emp-didaticos-back.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const idEquipamento = params.get("id");

    // listeners
    document.getElementById("btnVoltar").addEventListener("click", () => {
        window.location.href = "equipamento-listar.html";
    });
    document.getElementById("btnLimpar").addEventListener("click", () => {
        document.getElementById("formEquipamento").reset();
    });
    document.getElementById("btnCancelar").addEventListener("click", () => {
        window.location.href = "equipamento-listar.html";
    });

    document.getElementById("formEquipamento").addEventListener("submit", async (e) => {
        e.preventDefault();
        await salvarEquipamento(idEquipamento);
    });

    if (idEquipamento) {
        prepararEdicaoUI();
        carregarEquipamentoPorId(idEquipamento);
    } else {
        document.title = "Cadastro de Equipamento";
    }
});

function prepararEdicaoUI() {
    document.getElementById("tituloEquipamento").innerText = "Edição de Equipamento";
    document.title = "Edição de Equipamento";
    document.getElementById("btnCancelar").classList.remove("hidden");
    document.getElementById("btnSalvar").textContent = "Atualizar";
}

async function carregarEquipamentoPorId(idEquipamento) {
    const btnSalvar = document.getElementById("btnSalvar");
    const voltarBtns = document.querySelectorAll(".btn-voltar");
    const original = btnSalvar.textContent;

    try {
        btnSalvar.disabled = true;
        voltarBtns.forEach((b) => (b.disabled = true));
        btnSalvar.textContent = "Carregando...";

        let equipamento = await fetchEquipQuery(idEquipamento);

        if (!equipamento) {
            alert("Equipamento não encontrado.");
            window.location.href = "equipamento-listar.html";
            return;
        }

        document.getElementById("nome").value = equipamento.nome || "";
        document.getElementById("categoria").value = equipamento.categoria || "";
        document.getElementById("status").value = equipamento.status || "";
    } catch (err) {
        console.error("Erro ao carregar equipamento:", err);
        alert("Erro ao carregar os dados do equipamento.");
        window.location.href = "equipamento-listar.html";
    } finally {
        btnSalvar.disabled = false;
        voltarBtns.forEach((b) => (b.disabled = false));
        btnSalvar.textContent = original;
    }
}

async function fetchEquipQuery(id) {
    try {
        const r = await fetch(`${API_URL}/listar/equipamentos`);
        if (!r.ok) return null;
        const data = await r.json();
        if (Array.isArray(data)) {
            return data.find((e) => String(e.idEquipamento) === String(id)) || null;
        }
        return null;
    } catch {
        return null;
    }
}

async function salvarEquipamento(idEquipamento) {
    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const status = document.getElementById("status").value;

    if (!nome || !categoria || !status) {
        alert("Preencha todos os campos.");
        return;
    }

    const payload = { nome, categoria, status };
    const isEdicao = Boolean(idEquipamento);
    const endpoint = isEdicao
        ? `${API_URL}/atualiza/equipamento/${idEquipamento}`
        : `${API_URL}/novo/equipamento`;
    const metodo = isEdicao ? "PUT" : "POST";

    const btnSalvar = document.getElementById("btnSalvar");
    const original = btnSalvar.textContent;

    try {
        btnSalvar.disabled = true;
        btnSalvar.textContent = isEdicao ? "Atualizando..." : "Salvando...";

        const res = await fetch(endpoint, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert("Erro ao salvar o equipamento.");
            return;
        }

        alert(`Equipamento ${isEdicao ? "atualizado" : "cadastrado"} com sucesso!`);
        window.location.href = "equipamento-listar.html";
    } catch (err) {
        console.error("Erro ao salvar equipamento:", err);
        alert("Erro ao salvar o equipamento.");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = original;
    }
}
