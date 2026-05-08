# Arquivos de templates de e-mail

O back-end suporta dois tipos de arquivos vinculados ao **template**, porque o template representa o e-mail completo que será enviado:

1. **Assets inline do template**: imagens/recursos usados no HTML via `cid:`.
2. **Anexos comuns do template**: PDFs, propostas, contratos, boletos, apresentações ou outros arquivos que aparecem como anexos normais para o destinatário.

A campanha não possui arquivos próprios. Ela apenas orquestra o envio, vinculando SMTP sender, audiência e template.

## Modelo conceitual

- `Campaign`: remetente/SMTP, audiência selecionada, status e template escolhido.
- `Template`: assunto/conteúdo do e-mail, variáveis, imagens inline via CID e anexos comuns.
- `Dispatch Worker`: ao enviar, busca os arquivos do template e monta os `attachments` do Nodemailer.

## Endpoints

### Assets inline do template

```http
POST   /templates/:templateId/inline-assets
GET    /templates/:templateId/inline-assets
GET    /templates/:templateId/inline-assets/:fileId
DELETE /templates/:templateId/inline-assets/:fileId
```

### Anexos comuns do template

```http
POST   /templates/:templateId/attachments
GET    /templates/:templateId/attachments
GET    /templates/:templateId/attachments/:fileId
DELETE /templates/:templateId/attachments/:fileId
```

Não existem endpoints de anexos em `/campaigns/:campaignId/attachments`, porque arquivos não pertencem à campanha nesse modelo.

## Payloads

### Asset inline

```json
{
  "originalName": "logo-garbo.png",
  "storedName": "logo-garbo.png",
  "mimeType": "image/png",
  "sizeBytes": 154332,
  "storageKey": "storage/templates/template-001/logo-garbo.png",
  "cid": "logo-garbo"
}
```

### Anexo comum

```json
{
  "originalName": "proposta-comercial.pdf",
  "storedName": "proposta-comercial.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 781245,
  "storageKey": "storage/templates/template-001/proposta-comercial.pdf"
}
```

## Resposta

```json
{
  "id": "7e3f0c6e-7b91-4a9d-9ad0-0c7c7c6e9c11",
  "templateId": "template-001",
  "kind": "template_inline_asset",
  "originalName": "logo-garbo.png",
  "storedName": "logo-garbo.png",
  "mimeType": "image/png",
  "sizeBytes": 154332,
  "storageKey": "storage/templates/template-001/logo-garbo.png",
  "cid": "logo-garbo",
  "createdAt": "2026-05-07T20:40:00.000Z",
  "updatedAt": "2026-05-07T20:40:00.000Z"
}
```

## Validações

- Asset inline exige `cid`.
- Anexo comum não aceita `cid`.
- `cid` é único por template para assets inline.
- O worker valida as referências `cid:` do HTML antes do envio.
- Se o HTML usa `cid:logo-garbo` e não existe asset com `cid = logo-garbo`, o envio é marcado como erro para evitar imagem quebrada.

## Observação sobre upload

A API registra metadados e `storageKey`. Ela ainda não recebe binário via `multipart/form-data`. O arquivo precisa estar disponível no storage/caminho acessível pelo worker antes do cadastro dos metadados.
