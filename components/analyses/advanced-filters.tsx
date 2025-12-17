"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, FilterIcon } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FilterValues {
  status?: string
  repository?: string
  dateFrom?: Date
  dateTo?: Date
  severity?: string
  minFindings?: number
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  repositories: any[]
}

export function AdvancedFilters({
  onFilterChange,
  repositories,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({})
  const [isOpen, setIsOpen] = useState(false)

  const handleApplyFilters = () => {
    onFilterChange(filters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    onFilterChange({})
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filtros Avançados
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-semibold">Filtros Avançados</h4>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repositório</Label>
            <Select
              value={filters.repository}
              onValueChange={(value) =>
                setFilters({ ...filters, repository: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(filters.dateFrom, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) =>
                    setFilters({ ...filters, dateFrom: date })
                  }
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Findings Mínimos</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minFindings || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minFindings: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
