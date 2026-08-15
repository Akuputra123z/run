"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import { Popover } from "radix-ui"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ComboboxOption = {
    value: string
    label: string
    sublabel?: string
}

type ComboboxProps = {
    value: string
    placeholder?: string
    emptyMessage?: string
    loadOptions: (query: string) => Promise<ComboboxOption[]>
    onSelect: (option: ComboboxOption) => void
    disabled?: boolean
    invalid?: boolean
    className?: string
}

function Combobox({
    value,
    placeholder = "Pilih…",
    emptyMessage = "Tidak ada hasil.",
    loadOptions,
    onSelect,
    disabled,
    invalid,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [options, setOptions] = React.useState<ComboboxOption[]>([])
    const [loading, setLoading] = React.useState(false)
    const timer = React.useRef<number | null>(null)

    const load = React.useCallback(
        async (q: string) => {
            setLoading(true)
            setOptions(await loadOptions(q))
            setLoading(false)
        },
        [loadOptions],
    )

    React.useEffect(() => {
        if (open) {
            setQuery("")
            load("")
        }

        return () => {
            if (timer.current) {
                window.clearTimeout(timer.current)
            }
        }
    }, [open, load])

    const onQueryChange = (q: string) => {
        setQuery(q)

        if (timer.current) {
            window.clearTimeout(timer.current)
        }

        timer.current = window.setTimeout(() => load(q), 250)
    }

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    aria-invalid={invalid}
                    className={cn(
                        "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50",
                    !value && "text-muted-foreground",
                    className,
                )}
            >
                <span className="truncate font-mono font-bold uppercase">{value || placeholder}</span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </button>
            </Popover.Trigger>
            <Popover.Content
                align="start"
                sideOffset={4}
                className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
                <div className="relative mb-1">
                    <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Cari BIB / nama / kode…"
                        className="pl-7"
                    />
                </div>
                <div className="max-h-56 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" />
                            Mencari…
                        </div>
                    ) : options.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">{emptyMessage}</div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onSelect(option)
                                    setOpen(false)
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <span className="flex min-w-0 flex-col">
                                    <span className="font-mono font-bold">{option.label}</span>
                                    {option.sublabel && (
                                        <span className="truncate text-xs text-muted-foreground">{option.sublabel}</span>
                                    )}
                                </span>
                                {value === option.value && <Check className="size-4 shrink-0 text-emerald-600" />}
                            </button>
                        ))
                    )}
                </div>
            </Popover.Content>
        </Popover.Root>
    )
}

export { Combobox }