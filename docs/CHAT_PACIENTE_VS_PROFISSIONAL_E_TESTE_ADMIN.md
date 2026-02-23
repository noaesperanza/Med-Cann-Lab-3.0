# Chat: Paciente vs Profissional e teste como Admin

## Agendar vs Agendamento (conceito)

- **Agendar / agendar consulta** = a **ação**: o indivíduo que marca a consulta. → A Nôa abre o **card no chat** (horários, valor, confirmar). Não muda de aba.
  - Inclui: "quero agendar", "agendar", "agendar consulta", "agendar com médico X", "agendar com Dr. Y", "queria uma consulta", "consulta com o médico", "consulta com profissional [nome]".
- **Agendamento(s) / minha agenda** = o **lugar**: a aba/tela onde existe o calendário daquele perfil. → A Nôa **navega** para essa tela (paciente: "Meus agendamentos"; profissional: aba Agendamentos do Terminal).
  - Inclui: "ver agendamento", "me levar para agendamento", "agendamento", "abrir agendamento", "ir para agendamentos", "minha agenda", "meus agendamentos" (paciente).

Assim não há confusão: quem quer **agendar** (ação) vê o card; quem quer **ver/ir para agendamento** (lugar) é levado à aba correta do perfil.

---

## Separação por perfil

### Paciente (ou admin “ver como: paciente”)
- **Agendar / ver horários:** a Nôa mostra o **card no chat** (calendário, horários, valor, confirmar). Não muda de aba.
- **“Abrir” / “sim”** depois de “vou abrir o sistema de agendamento” → **card no chat** (não navega).
- **“Meus agendamentos”** → navega para a rota do paciente: `/app/clinica/paciente/agendamentos`.
- **Não recebe:** “abrir agenda” (aba do profissional), terminal de atendimento, prescrição, filtro de pacientes.

### Profissional (ou admin “ver como: profissional”)
- **“Abrir agenda” / “minha agenda” / “ir para agendamentos”** → **navega** para a aba Agendamentos do Terminal (não card no chat).
- **“Quero agendar” / “ver horários para agendar”** (ex.: marcar consulta para si) → pode abrir o **card no chat** (mesmo fluxo de agendamento).
- Recebe comandos de terminal: atendimento, pacientes, relatórios, chat profissionais, prescrição, biblioteca, etc.

### Quem manda no Core
O Core usa o **tipo efetivo** que vem no `platformData.user.user_type` / `user.type`:
- **Admin:** o front envia o **“ver como”** (paciente ou profissional) como tipo efetivo, não “admin”.
- Assim o Core aplica as mesmas regras de paciente ou profissional e não mistura os fluxos.

---

## Como você (admin) testar o chat

- **Pode testar em qualquer aba.** O comportamento do chat depende do **“ver como”** (paciente ou profissional), não da URL em que você está.
- **Não é obrigatório** ir em cada dashboard (paciente / profissional) para testar; basta trocar o “ver como” no seletor do Header.
- **Fluxo sugerido:**
  1. **Ver como: Paciente** → abra o chat, diga “quero agendar com o Ricardo” e depois “abrir”. Deve aparecer o **card no chat** (horários, valor) e **não** mudar para a aba do profissional.
  2. **Ver como: Profissional** → no chat, diga “abrir agenda” ou “minha agenda”. Deve **navegar** para a aba Agendamentos e **não** mostrar o card de agendamento no chat.
  3. Em qualquer aba (admin, clínica, etc.), o que vale é o **“ver como”** atual; o chat segue esse perfil.

Resumo: **paciente = card no chat para agendar; profissional = aba Agendamentos ao pedir “abrir agenda”.** Admin testa em qualquer lugar trocando só o “ver como”.
