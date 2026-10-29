"use client";

import { PageHeader } from "@/components/brand/page-header";
import { Bandeirola, type BandeirolaCor } from "@/components/brand/bandeirola";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToastManager } from "@/components/ui/toast";

const cores: { nome: string; cor: BandeirolaCor; hex: string }[] = [
  { nome: "Rosa", cor: "rosa", hex: "#EC4899" },
  { nome: "Rosa escuro", cor: "rosa-escuro", hex: "#BE185D" },
  { nome: "Roxo vivo", cor: "roxo-vivo", hex: "#7C3AED" },
  { nome: "Roxo profundo", cor: "roxo", hex: "#4C1D95" },
  { nome: "Lilás", cor: "lilas", hex: "#F5F0FF" },
  { nome: "Branco", cor: "branco", hex: "#FFFFFF" },
];

function Campo({
  id,
  label,
  erro,
  children,
}: {
  id: string;
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-brand-ink">
        {label}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-sm text-brand-pink-dark">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function AvisoDemo() {
  const { add } = useToastManager();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          add({
            title: "Inscrição recebida",
            description: "A gente responde em breve.",
            type: "info",
          })
        }
      >
        Aviso
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          add({
            title: "Não foi possível salvar",
            description: "Confira os campos e tente de novo.",
            type: "error",
            priority: "high",
          })
        }
      >
        Aviso de erro
      </Button>
    </div>
  );
}

export function DesignSystemGallery() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-10">
      <PageHeader
        title="Design system"
        description="Cores, tipos e componentes das Mermãs Digitais. Tab percorre os controles. Os desabilitados ficam de fora da ordem. Erro aparece em rosa escuro."
      />

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Paleta" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cores.map((item) => (
            <li
              key={item.hex}
              className="flex items-center gap-3 rounded-xl border border-brand-purple/20 bg-white p-3 shadow-sm"
            >
              <span
                className="size-12 rounded-lg border border-brand-purple/20"
                style={{ backgroundColor: item.hex }}
              />
              <span>
                <span className="block font-heading font-semibold">{item.nome}</span>
                <span className="text-sm text-brand-purple">{item.hex}</span>
              </span>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-xl border border-brand-purple/20 bg-white p-3 shadow-sm">
            <span className="size-12 rounded-lg bg-brand-ink" />
            <span>
              <span className="block font-heading font-semibold">Texto</span>
              <span className="text-sm text-brand-purple">#1E1033</span>
            </span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader
          level={2}
          title="Tipos"
          description="Poppins nos títulos. Atkinson Hyperlegible no texto corrido."
        />
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Um título em Poppins</CardTitle>
            <CardDescription>
              Atkinson deixa o texto longo mais fácil de ler, sem enfeite extra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="max-w-2xl leading-7">
              A oficina começa no horário combinado. Traga o que você já sabe e
              o que ainda quer perguntar. O espaço é direto, acolhedor e sem
              pressa de parecer outra coisa.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Bandeirolas" />
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
          <Bandeirola texto="Oficina" cor="rosa" />
          <Bandeirola letra="A" cor="roxo-vivo" />
          <Bandeirola letra="B" cor="roxo" />
          <Bandeirola letra="C" cor="rosa-escuro" />
          <Bandeirola letra="D" cor="lilas" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Botões" />
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button disabled>Desabilitado</Button>
          <Button aria-invalid="true">Com erro</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Campos" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Campo id="nome" label="Nome">
            <Input id="nome" name="nome" placeholder="Seu nome" />
          </Campo>
          <Campo id="cidade" label="Cidade desabilitada">
            <Input id="cidade" defaultValue="Recife" disabled />
          </Campo>
          <Campo id="email" label="E-mail" erro="Use um e-mail completo.">
            <Input
              id="email"
              type="email"
              defaultValue="ana@"
              aria-invalid="true"
              aria-describedby="email-erro"
            />
          </Campo>
          <Campo id="recado" label="Recado">
            <Textarea id="recado" placeholder="Escreva o que quiser perguntar" />
          </Campo>
          <Campo id="nota" label="Nota desabilitada">
            <Textarea id="nota" defaultValue="Campo fechado." disabled />
          </Campo>
          <Campo id="bio" label="Apresentação" erro="Falta contar de onde você vem.">
            <Textarea
              id="bio"
              defaultValue="Oi."
              aria-invalid="true"
              aria-describedby="bio-erro"
            />
          </Campo>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Seleção" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Campo id="atividade" label="Atividade">
            <Select defaultValue="oficina">
              <SelectTrigger id="atividade" className="w-full">
                <SelectValue placeholder="Escolha uma atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oficina">Oficina</SelectItem>
                <SelectItem value="roda">Roda de conversa</SelectItem>
                <SelectItem value="mentoria" disabled>
                  Mentoria
                </SelectItem>
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="turno" label="Turno desabilitado">
            <Select disabled defaultValue="manha">
              <SelectTrigger id="turno" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã</SelectItem>
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="sala" label="Sala" erro="Escolha uma sala.">
            <Select>
              <SelectTrigger
                id="sala"
                className="w-full"
                aria-invalid="true"
                aria-describedby="sala-erro"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sala 1</SelectItem>
                <SelectItem value="2">Sala 2</SelectItem>
              </SelectContent>
            </Select>
          </Campo>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Caixas de seleção" />
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox aria-labelledby="check-programa" />
            <span id="check-programa">Quero receber a programação</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-brand-purple/60">
            <Checkbox disabled defaultChecked aria-labelledby="check-fechado" />
            <span id="check-fechado">Opção desabilitada</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                aria-invalid="true"
                aria-labelledby="check-erro"
                aria-describedby="check-erro-msg"
              />
              <span id="check-erro">Aceito o combinado do encontro</span>
            </label>
            <p id="check-erro-msg" role="alert" className="text-sm text-brand-pink-dark">
              Marque para continuar.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Cartão e selos" />
        <Card className="max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Encontro de sábado</CardTitle>
            <CardDescription>Das 10h às 13h, com intervalo no meio.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge render={<a href="#selos" />}>Rosa</Badge>
            <Badge variant="secondary">Roxo</Badge>
            <Badge variant="outline">Contorno</Badge>
            <Badge aria-disabled="true">Desabilitado</Badge>
            <Badge aria-invalid="true" variant="destructive">
              Erro
            </Badge>
          </CardContent>
        </Card>
      </section>

      <section id="selos" className="flex flex-col gap-4">
        <PageHeader level={2} title="Abas" />
        <Tabs defaultValue="oficina">
          <TabsList>
            <TabsTrigger value="oficina">Oficina</TabsTrigger>
            <TabsTrigger value="roda">Roda</TabsTrigger>
            <TabsTrigger value="arquivo" disabled>
              Arquivo
            </TabsTrigger>
          </TabsList>
          <TabsContent value="oficina" className="rounded-xl bg-white p-4 shadow-sm">
            Traga um computador. O foco entra na aba com as setas do teclado.
          </TabsContent>
          <TabsContent value="roda" className="rounded-xl bg-white p-4 shadow-sm">
            A roda é para perguntas, sem slide obrigatório.
          </TabsContent>
        </Tabs>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Diálogo" />
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>
            Abrir diálogo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar presença</DialogTitle>
              <DialogDescription>
                Esc fecha. O foco permanece aqui até você sair.
              </DialogDescription>
            </DialogHeader>
            <Campo id="dialogo-nome" label="Nome no crachá" erro="Este campo é obrigatório.">
              <Input
                id="dialogo-nome"
                aria-invalid="true"
                aria-describedby="dialogo-nome-erro"
              />
            </Campo>
            <DialogFooter>
              <Button>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader level={2} title="Avisos" />
        <AvisoDemo />
      </section>

      <section className="flex flex-col gap-4">
        <PageHeader
          level={2}
          title="Tabela"
          description="A primeira linha recebe foco. A segunda está desabilitada. A terceira está em erro."
        />
        <Card className="shadow-md">
          <CardContent className="px-2">
            <Table>
              <TableCaption>Lista de inscrições de exemplo.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow tabIndex={0}>
                  <TableCell>Ana</TableCell>
                  <TableCell>Oficina</TableCell>
                  <TableCell>Confirmada</TableCell>
                </TableRow>
                <TableRow data-disabled="true">
                  <TableCell>Bia</TableCell>
                  <TableCell>Roda</TableCell>
                  <TableCell>Lista de espera</TableCell>
                </TableRow>
                <TableRow data-state="error" tabIndex={0}>
                  <TableCell>Cris</TableCell>
                  <TableCell>Mentoria</TableCell>
                  <TableCell>Falta o e-mail</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
