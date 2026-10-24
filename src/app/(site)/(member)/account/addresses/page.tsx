"use client";

import { useState } from "react";
import { profileApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Checkbox, ConfirmDialog, EmptyState, ErrorState, FormGrid, Input, PageHeader, Pill, Segmented, Sheet, Skeleton, whenOpen } from "@/components/ui";
import { Edit, Location, Plus, Trash } from "@/components/icons";
import { humanize } from "@/utils/format";
import type { Address, AddressInput, AddressType } from "@/types/api";

const EMPTY: AddressInput = { address_type: "HOME", street_address: "", apartment_number: "", city: "", state_province: "", postal_code: "", country: "Nigeria", is_primary: false };

function AddressSheetBody({ open, address, onClose, onSaved }: { open: boolean; address: Address | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AddressInput>(address ? { ...address } : EMPTY);
  const save = useMutation(() => {
    const { id: _i, created_at: _c, latitude: _la, longitude: _lo, ...body } = form as Address;
    return address ? profileApi.updateAddress(address.id, body) : profileApi.addAddress(body);
  }, { success: "Address saved", onSuccess: () => { onClose(); onSaved(); } });
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Sheet open={open} onClose={onClose} title={address ? "Edit address" : "Add an address"} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={save.busy} onClick={() => save.run()}>Save</Button></>}>
      <div className="space-y-4">
        <Segmented label="Type" value={(form.address_type ?? "HOME") as AddressType} onChange={v => setForm(f => ({ ...f, address_type: v }))} options={[{ value: "HOME", label: "Home" }, { value: "WORK", label: "Work" }, { value: "OTHER", label: "Other" }]} />
        <Input label="Street address" required value={form.street_address ?? ""} onChange={set("street_address")} error={save.fieldErrors.street_address} />
        <Input label="Flat or suite" value={form.apartment_number ?? ""} onChange={set("apartment_number")} />
        <FormGrid>
          <Input label="City" required value={form.city ?? ""} onChange={set("city")} error={save.fieldErrors.city} />
          <Input label="State" required value={form.state_province ?? ""} onChange={set("state_province")} error={save.fieldErrors.state_province} />
          <Input label="Postal code" value={form.postal_code ?? ""} onChange={set("postal_code")} error={save.fieldErrors.postal_code} />
          <Input label="Country" required value={form.country ?? ""} onChange={set("country")} error={save.fieldErrors.country} />
        </FormGrid>
        <Checkbox checked={!!form.is_primary} onChange={v => setForm(f => ({ ...f, is_primary: v }))} label="Use as my main address" />
      </div>
    </Sheet>
  );
}
const AddressSheet = whenOpen(AddressSheetBody);

export default function AddressesPage() {
  const list = useQuery(() => profileApi.addresses(), []);
  const [editing, setEditing] = useState<{ open: boolean; address: Address | null }>({ open: false, address: null });
  const [removing, setRemoving] = useState<Address | null>(null);
  const remove = useMutation((id: number) => profileApi.removeAddress(id), { success: "Address removed", onSuccess: () => { setRemoving(null); void list.reload(); } });
  const rows = list.data?.results ?? [];
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Addresses" }]} title="Saved addresses" description="For receipts and your profile."
        actions={<Button icon={Plus} onClick={() => setEditing({ open: true, address: null })}>Add address</Button>} />
      {list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : list.loading ? <Skeleton className="h-24 w-full rounded-2xl" /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface"><EmptyState icon={Location} title="No addresses yet" action={<Button variant="secondary" onClick={() => setEditing({ open: true, address: null })}>Add one</Button>} /></div>
      ) : (
        <ul className="space-y-3">{rows.map(a => (
          <li key={a.id} className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary"><Location className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">{humanize(a.address_type)}{a.is_primary && <Pill tone="primary" dot={false}>Main</Pill>}</p>
              <p className="text-sm text-ink-2">{[a.apartment_number, a.street_address].filter(Boolean).join(", ")}</p>
              <p className="text-sm text-muted">{[a.city, a.state_province, a.postal_code, a.country].filter(Boolean).join(", ")}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing({ open: true, address: a })}><Edit className="h-[18px] w-[18px]" /></Button>
            <Button size="icon" variant="danger-ghost" aria-label="Remove" onClick={() => setRemoving(a)}><Trash className="h-[18px] w-[18px]" /></Button>
          </li>
        ))}</ul>
      )}
      <AddressSheet {...editing} onClose={() => setEditing({ open: false, address: null })} onSaved={list.reload} />
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} title="Remove this address?" confirmLabel="Remove" busy={remove.busy} onConfirm={() => removing && remove.run(removing.id)} />
    </Container>
  );
}
