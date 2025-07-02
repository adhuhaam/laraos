import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Users,
  Settings,
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Circle,
  Minus,
  Plus,
  X
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useHRData, HRStaff } from './HRDataContext'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'file' | 'system'
  status: 'sent' | 'delivered' | 'read'
  replyTo?: string
}

interface ChatContact {
  id: string
  name: string
  role: string
  department: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: Date
  unreadCount: number
  lastMessage?: string
  lastMessageTime?: Date
}

interface ChatConversation {
  id: string
  participants: string[]
  messages: ChatMessage[]
  type: 'direct' | 'group'
  name?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Convert HR staff to chat contacts with mock conversation data
const convertHRStaffToContacts = (hrStaff: HRStaff[]): ChatContact[] => {
  const mockConversationData: Record<string, { unreadCount: number; lastMessage?: string; lastMessageTime?: Date }> = {
    'hr-1': {
      unreadCount: 2,
      lastMessage: 'Please review the new disciplinary letter template',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000)
    },
    'hr-2': {
      unreadCount: 0,
      lastMessage: 'Employee registration completed',
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000)
    },
    'hr-3': {
      unreadCount: 1,
      lastMessage: 'Work permit medical reports ready',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000)
    },
    'hr-4': {
      unreadCount: 0,
      lastMessage: 'Salary calculations updated',
      lastMessageTime: new Date(Date.now() - 60 * 60 * 1000)
    },
    'hr-5': {
      unreadCount: 0,
      lastMessage: 'VISA applications processed',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    'hr-6': {
      unreadCount: 1,
      lastMessage: 'Training schedule is ready for review',
      lastMessageTime: new Date(Date.now() - 45 * 60 * 1000)
    }
  }

  return hrStaff.map(staff => ({
    id: staff.id,
    name: staff.name,
    role: staff.role,
    department: staff.department,
    avatar: staff.avatar,
    status: staff.status,
    lastSeen: staff.lastSeen,
    unreadCount: mockConversationData[staff.id]?.unreadCount || 0,
    lastMessage: mockConversationData[staff.id]?.lastMessage,
    lastMessageTime: mockConversationData[staff.id]?.lastMessageTime
  }))
}

// Mock conversations with messages
const mockConversations: ChatConversation[] = [
  {
    id: 'conv-hr-1',
    participants: ['current-user', 'hr-1'],
    type: 'direct',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    messages: [
      {
        id: 'msg-1',
        senderId: 'hr-1',
        senderName: 'N.B Rajanayaka',
        content: 'Good morning! Can you please review the updated disciplinary letter template?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-2',
        senderId: 'hr-1',
        senderName: 'N.B Rajanayaka',
        content: 'We need to ensure all the legal requirements are covered.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv-hr-2',
    participants: ['current-user', 'hr-2'],
    type: 'direct',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    messages: [
      {
        id: 'msg-3',
        senderId: 'current-user',
        senderName: 'Current User',
        content: 'How is the employee registration process going?',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-4',
        senderId: 'hr-2',
        senderName: 'Sarah Johnson',
        content: 'All registrations for this week have been completed successfully.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'text',
        status: 'read'
      }
    ]
  }
]

export function HRChat() {
  const { hrStaff, updateHRStaffStatus } = useHRData()
  
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations)
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Update contacts when HR staff changes
  useEffect(() => {
    setContacts(convertHRStaffToContacts(hrStaff))
  }, [hrStaff])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [contacts, searchQuery])

  // Select contact and find/create conversation
  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact)
    
    // Find existing conversation
    const conversation = conversations.find(conv => 
      conv.participants.includes(contact.id) && conv.participants.includes('current-user')
    )
    
    if (conversation) {
      setSelectedConversation(conversation)
      // Mark messages as read
      markMessagesAsRead(conversation.id)
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: `conv-${Date.now()}`,
        participants: ['current-user', contact.id],
        type: 'direct',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setSelectedConversation(newConversation)
      setConversations(prev => [...prev, newConversation])
    }
  }

  // Mark messages as read
  const markMessagesAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            status: msg.senderId !== 'current-user' ? 'read' as const : msg.status
          }))
        }
      }
      return conv
    }))
    
    // Update contact unread count
    if (selectedContact) {
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, unreadCount: 0 }
          : contact
      ))
    }
  }

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !selectedContact) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Current User',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    }

    // Add message to conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          updatedAt: new Date()
        }
      }
      return conv
    }))

    // Update selected conversation
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: new Date()
    } : null)

    // Update contact's last message
    setContacts(prev => prev.map(contact => 
      contact.id === selectedContact.id 
        ? { 
            ...contact, 
            lastMessage: newMessage.trim(),
            lastMessageTime: new Date()
          }
        : contact
    ))

    setNewMessage('')
    
    // Simulate message delivery
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === message.id ? { ...msg, status: 'delivered' } : msg
            )
          }
        }
        return conv
      }))
    }, 1000)

    toast.success('Message sent successfully')
  }

  // Handle typing indicator
  useEffect(() => {
    if (newMessage) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  // Get status indicator color
  const getStatusColor = (status: ChatContact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60 * 1000) return 'Just now'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
    return date.toLocaleDateString()
  }

  // Get message status icon
  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered': return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      {/* Contacts Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              HR Team Chat
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost">
                <Users className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelectContact(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.unreadCount > 0 && (
                        <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center bg-primary">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                    {contact.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {contact.lastMessage}
                      </p>
                    )}
                    {contact.lastMessageTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(contact.lastMessageTime)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedContact && selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedContact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(selectedContact.status)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.status === 'online' ? 'Online' : 
                       selectedContact.status === 'away' ? 'Away' :
                       selectedContact.status === 'busy' ? 'Busy' : 
                       selectedContact.lastSeen ? `Last seen ${formatTime(selectedContact.lastSeen)}` : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.senderId === 'current-user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.senderId === 'current-user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                        message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.senderId === 'current-user' && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <Circle className="h-2 w-2 fill-current animate-bounce" style={{ animationDelay: '0ms' }} />
                          <Circle className="h-2 w-2 fill-current animate-bounce" style={{ animationDelay: '150ms' }} />
                          <Circle className="h-2 w-2 fill-current animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">typing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome to HR Team Chat</h3>
              <p className="text-muted-foreground">
                Select a contact from the sidebar to start chatting with your HR team members.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}