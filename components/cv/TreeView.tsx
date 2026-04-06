'use client'
import { useState, useMemo } from 'react'
import { CVData, Experience, Education, Skill, CVSection } from '@/types/cv'
import { User, Briefcase, GraduationCap, Code, Plus, GripVertical } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableSection } from './SortableSection'
import { SortableItem } from './SortableItem'
import { SECTION_REGISTRY } from '@/lib/section-registry'

interface TreeNode {
  id: string
  label: string
  icon?: IconSvgElement
  children: TreeNode[]
  count?: number
  isSingleSection?: boolean
}

interface TreeViewProps {
  cvData: CVData
  onNodeSelect: (nodeId: string, type: string) => void
  selectedNode: string | null
}

export function TreeView({ cvData, onNodeSelect, selectedNode }: TreeViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)

  // Derive section order from cvData (reactive to changes)
  const sectionOrder = useMemo<string[]>(() => {
    const dynamicSections = (cvData as CVData & { sections?: CVSection[] }).sections || []
    const dynamicIds = dynamicSections.map(s => s.id)

    // Start with legacy section IDs
    const legacyIds = ['profile', 'experience', 'education', 'skills']

    // If we have a saved sectionOrder, use it but add any new dynamic sections
    if (cvData.sectionOrder && Array.isArray(cvData.sectionOrder)) {
      const newIds = dynamicIds.filter(id => !cvData.sectionOrder!.includes(id))
      return [...cvData.sectionOrder, ...newIds]
    }

    // Otherwise, return legacy IDs + dynamic IDs
    return [...legacyIds, ...dynamicIds]
  }, [cvData])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    })
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeIdStr = active.id as string
    const overIdStr = over.id as string

    // Section reordering (both legacy and dynamic sections)
    if (activeIdStr.startsWith('section-') || !activeIdStr.includes('-')) {
      const oldIndex = sectionOrder.indexOf(activeIdStr)
      const newIndex = sectionOrder.indexOf(overIdStr)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sectionOrder, oldIndex, newIndex)

        // Update order property for dynamic sections based on their new position
        const dynamicSections = (cvData as CVData & { sections?: CVSection[] }).sections || []
        const updatedSections = dynamicSections.map(section => {
          const newOrderIndex = newOrder.indexOf(section.id)
          return {
            ...section,
            order: newOrderIndex >= 0 ? newOrderIndex : section.order
          }
        }).sort((a, b) => a.order - b.order)

        // Send the updated sectionOrder and sections back to parent
        onNodeSelect(JSON.stringify({
          sectionOrder: newOrder,
          sections: updatedSections
        }), 'reorder-section')
      }
    }

    // Item reordering within sections
    if (activeIdStr.includes('-') && !activeIdStr.startsWith('section-')) {
      const [sectionType] = activeIdStr.split('-')

      // Handle legacy sections
      let items: (Experience | Education | Skill)[] = []
      if (sectionType === 'experience') items = [...(cvData.experience || [])]
      if (sectionType === 'education') items = [...(cvData.education || [])]
      if (sectionType === 'skill') items = [...(cvData.skills || [])]

      const oldIndex = items.findIndex(item => item.id === activeIdStr)
      const newIndex = items.findIndex(item => item.id === overIdStr)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx,
        }))

        // Update the appropriate section in cvData
        if (sectionType === 'experience') {
          onNodeSelect(JSON.stringify({ experience: newItems }), 'reorder-items')
        } else if (sectionType === 'education') {
          onNodeSelect(JSON.stringify({ education: newItems }), 'reorder-items')
        } else if (sectionType === 'skill') {
          onNodeSelect(JSON.stringify({ skills: newItems }), 'reorder-items')
        }
      }

      // Handle dynamic sections
      const dynamicSections = (cvData as CVData & { sections?: CVSection[] }).sections || []
      const dynamicSection = dynamicSections.find(s => s.id === sectionType)

      if (dynamicSection && dynamicSection.data) {
        const typedData = dynamicSection.data as Record<string, unknown>[]
        const oldIndex = typedData.findIndex((item) => String(item.id) === activeIdStr)
        const newIndex = typedData.findIndex((item) => String(item.id) === overIdStr)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newData = arrayMove(dynamicSection.data, oldIndex, newIndex)
          onNodeSelect(JSON.stringify({
            sections: dynamicSections.map(s =>
              s.id === sectionType ? { ...s, data: newData } : s
            )
          }), 'reorder-items')
        }
      }
    }
  }

  const buildTree = (): TreeNode[] => {
    const dynamicSections = (cvData as CVData & { sections?: CVSection[] }).sections || []

    const sections = [
      {
        id: 'profile',
        label: cvData.sectionHeaders?.personalInfo || 'Profile',
        icon: User,
        children: [],
        isSingleSection: true
      },
      {
        id: 'experience',
        label: cvData.sectionHeaders?.experience || 'Experience',
        icon: Briefcase,
        children: cvData.experience?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((exp) => ({
          id: exp.id,
          label: exp.position || exp.company || 'Experience',
          icon: undefined,
          children: []
        })) || [],
        count: cvData.experience?.length || 0
      },
      {
        id: 'education',
        label: cvData.sectionHeaders?.education || 'Education',
        icon: GraduationCap,
        children: cvData.education?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((edu) => ({
          id: edu.id,
          label: edu.degree || edu.institution || 'Education',
          icon: undefined,
          children: []
        })) || [],
        count: cvData.education?.length || 0
      },
      {
        id: 'skills',
        label: cvData.sectionHeaders?.skills || 'Skills',
        icon: Code,
        children: cvData.skills?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((skill) => ({
          id: skill.id,
          label: skill.name,
          icon: undefined,
          children: []
        })) || [],
        count: cvData.skills?.length || 0
      },
      // Dynamic sections
      ...dynamicSections.map((section) => {
        const config = SECTION_REGISTRY[section.type] || SECTION_REGISTRY.custom
        const typedData = section.data as Record<string, unknown>[]
        return {
          id: section.id,
          label: section.header || section.label,
          icon: config.icon,
          children: typedData.map((item) => {
            // Try to find a meaningful label from the item
            const firstField = section.fieldConfig?.sort((a, b) => a.order - b.order)[0]
            const label = firstField ? String(item[firstField.id] || section.label) : 'Item'

            return {
              id: String(item.id || ''),
              label,
              icon: undefined,
              children: []
            }
          }),
          count: section.data.length
        }
      })
    ]

    // Sort sections by sectionOrder
    const sortedSections = sections.sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.id)
      const bIndex = sectionOrder.indexOf(b.id)
      return aIndex - bIndex
    })

    return sortedSections
  }

  const tree = buildTree()

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-72 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="mb-4">
          <Input placeholder="Search..." className="h-8 text-sm" />
        </div>

        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {tree.map((section) => (
              section.isSingleSection ? (
                // Profile section - not sortable
                <div
                  key={section.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                    selectedNode?.startsWith(section.id) ? 'bg-muted' : ''
                  }`}
                  onClick={() => onNodeSelect(section.id, 'section')}
                >
                  {section.icon && <HugeiconsIcon icon={section.icon} className="h-4 w-4" />}
                  <span className="flex-1 text-sm font-medium">{section.label}</span>
                </div>
              ) : (
                <SortableSection
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  icon={section.icon}
                  count={section.count}
                  isExpanded={expandedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  isSelected={selectedNode?.startsWith(section.id) ?? false}
                  onSelect={() => onNodeSelect(section.id, 'section')}
                >
                  {section.children.map((item) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      isSelected={selectedNode === item.id}
                      onSelect={() => onNodeSelect(item.id, 'item')}
                    />
                  ))}
                </SortableSection>
              )
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md opacity-50">
              <HugeiconsIcon icon={GripVertical} className="h-4 w-4" />
              <span className="text-sm">Dragging...</span>
            </div>
          ) : null}
        </DragOverlay>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onNodeSelect('add-section', 'add-section')}
          >
            <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>
    </DndContext>
  )
}
