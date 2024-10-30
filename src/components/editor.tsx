/* eslint-disable @typescript-eslint/no-unused-vars */
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PiTextAa } from 'react-icons/pi'
import { MdSend } from 'react-icons/md'
import { ImageIcon, Smile } from 'lucide-react'
import Quill, { type QuillOptions } from 'quill'
import { Delta, Op } from 'quill/core'
import { cn } from '@/lib/utils'
import Hint from './hint'
import { Button } from './ui/button'
import 'quill/dist/quill.snow.css'
type EditorValue = {
  image: File | null
  body: string
}
interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void
  onCancel?: () => void
  placeholder?: string
  defaultValue?: Delta | Op[]
  disabled?: boolean
  innerRef: MutableRefObject<Quill | null>
  variant?: 'create' | 'update'
}
export default function Editor({
  onSubmit,
  onCancel,
  placeholder = 'Write something...',
  defaultValue = [],
  disabled = false,
  innerRef,
  variant = 'create'
}: EditorProps) {
  const [text, setText] = useState('')
  const [isToolbarVisible, setToolbarVisible] = useState(true)
  const submitRef = useRef(onSubmit)
  const placeholderRef = useRef(placeholder)
  const quillRef = useRef<Quill | null>(null)
  const defaultValueRef = useRef(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const disabledRef = useRef(disabled)
  useLayoutEffect(() => {
    submitRef.current = onSubmit
    placeholderRef.current = placeholder
    defaultValueRef.current = defaultValue
    disabledRef.current = disabled
  })
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const editorContainer = container.appendChild(container.ownerDocument.createElement('div'))
    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [['bold', 'italic', 'strike'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]],
        keyboard: {
          bindings: {
            enter: {
              key: 'Enter',
              handler: () => {
                // TODO submit form
                return
              }
            },
            shift_enter: {
              key: 'Enter',
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, '\n')
              }
            }
          }
        }
      }
    }
    const quill = new Quill(editorContainer, options)
    quillRef.current = quill
    quillRef.current.focus()
    if (innerRef) {
      innerRef.current = quill
    }
    quill.setContents(defaultValueRef.current)
    setText(quill.getText())
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText())
    })
    return () => {
      quill.off(Quill.events.TEXT_CHANGE)
      if (container) {
        container.innerHTML = ''
      }
      if (quillRef.current) {
        quillRef.current = null
      }
      if (innerRef) {
        innerRef.current = null
      }
    }
  }, [innerRef])
  const toggleToolbar = () => {
    setToolbarVisible((prevState) => !prevState)
    const toolbarElement = document.querySelector('.ql-toolbar')
    if (toolbarElement) {
      toolbarElement.classList.toggle('hidden')
    }
  }
  const isEmpty = text.replace(/<(.|\n)*?>/g, '').trim().length === 0
  return (
    <div className='flex flex-col'>
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-md transition bg-white'>
        <div ref={containerRef} className='h-full ql-custom' />
        <div className='flex px-2 pb-2 z-[5]'>
          <Hint label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}>
            <Button disabled={disabled} size='iconSm' variant='ghost' onClick={toggleToolbar}>
              <PiTextAa className='size-4' />
            </Button>
          </Hint>
          <Hint label='Emoji'>
            <Button disabled={disabled} size='iconSm' variant='ghost' onClick={() => {}}>
              <Smile className='size-4' />
            </Button>
          </Hint>
          {variant === 'create' && (
            <Hint label='Attach file'>
              <Button disabled={disabled} size='iconSm' variant='ghost' onClick={() => {}}>
                <ImageIcon className='size-4' />
              </Button>
            </Hint>
          )}
          {variant === 'update' && (
            <div className='ml-auto flex items-center gap-x-2'>
              <Button disabled={disabled} size='sm' onClick={() => {}} variant='outline'>
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                size='sm'
                onClick={() => {}}
                className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
              >
                Save
              </Button>
            </div>
          )}
          {variant === 'create' && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => {}}
              size='iconSm'
              className={cn(
                'ml-auto',
                isEmpty
                  ? 'bg-white hover:bg-white text-muted-foreground'
                  : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
              )}
            >
              <MdSend className='size-4' />
            </Button>
          )}
        </div>
      </div>
      <div className='p-2 text-[10px] text-muted- flex justify-end'>
        <p>
          <strong>Shift + Enter</strong> to add a new line
        </p>
      </div>
    </div>
  )
}