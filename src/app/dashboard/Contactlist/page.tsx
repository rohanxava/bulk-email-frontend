
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../page-header';
import {
  Download,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: string;
}

interface ContactList {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  contacts: Contact[];
  createdAt: string;
  file: File;
}

export default function ContactListPage() {
  const { toast } = useToast();
  const [lists, setLists] = React.useState<ContactList[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isPreviewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [selectedList, setSelectedList] = React.useState<ContactList | null>(null);
  const [newListName, setNewListName] = React.useState('');
  const [fileToUpload, setFileToUpload] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === 'text/csv' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFileToUpload(file);
      } else {
        toast({
          title: 'Unsupported File Type',
          description: 'Please upload a .csv or .xlsx file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !newListName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a list name and select a file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result;
        let contacts: Contact[] = [];
        let parsedData: any[] = [];

        if (fileToUpload.type === 'text/csv') {
          const result = Papa.parse(fileContent as string, {
            header: true,
            skipEmptyLines: true,
          });
          parsedData = result.data;
        } else {
          const workbook = XLSX.read(fileContent, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        contacts = parsedData
          .map((row: any) => ({
            firstName: row.firstName || row.first_name || row.FirstName || '',
            lastName: row.lastName || row.last_name || row.LastName || '',
            email: row.email || row.Email || '',
          }))
          .filter(contact => contact.email && emailRegex.test(contact.email));

        if (contacts.length === 0) {
          toast({
            title: 'No Valid Contacts Found',
            description: 'The uploaded file must contain an "email" column with valid email addresses.',
            variant: 'destructive',
          });
          setIsUploading(false);
          return;
        }

        const newList: ContactList = {
          id: `list_${new Date().getTime()}`,
          name: newListName.trim(),
          fileName: fileToUpload.name,
          fileType: fileToUpload.type,
          contacts,
          createdAt: new Date().toISOString(),
          file: fileToUpload,
        };

        setLists((prev) => [newList, ...prev]);
        toast({
          title: 'List Uploaded',
          description: `Successfully uploaded "${newList.name}" with ${newList.contacts.length} contacts.`,
        });

        // Reset state
        setUploadDialogOpen(false);
        setNewListName('');
        setFileToUpload(null);
      };

      if (fileToUpload.type === 'text/csv') {
        reader.readAsText(fileToUpload);
      } else {
        reader.readAsArrayBuffer(fileToUpload);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error Processing File',
        description: 'There was an issue processing your file. Please check the format and try again.',
        variant: 'destructive',
      });
    } finally {
      // This timeout is to give the FileReader time to process
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  const handleRowClick = (list: ContactList) => {
    setSelectedList(list);
    setPreviewDialogOpen(true);
  };

  const handleDelete = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
    toast({
      title: 'List Deleted',
      description: 'The contact list has been successfully deleted.',
    });
  };

  const handleDownload = (list: ContactList) => {
    const url = URL.createObjectURL(list.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = list.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Contact Lists"
        description="Manage your contact lists for email campaigns."
      >
        <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload New Contact List</DialogTitle>
              <DialogDescription>
                Upload a CSV or XLSX file and give your list a name.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="list-name" className="text-right">
                  List Name
                </Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Newsletter Subscribers"
                  disabled={isUploading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">File</Label>
                <div className="col-span-3">
                  <label
                    htmlFor="contacts-file"
                    className="flex w-full items-center justify-center rounded-lg border-2 border-dashed bg-card p-4 text-center text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    {fileToUpload ? (
                      <span className="truncate">{fileToUpload.name}</span>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Click to upload (CSV, XLSX)</span>
                      </>
                    )}
                  </label>
                  <Input
                    id="contacts-file"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleFileUpload}
                disabled={isUploading || !fileToUpload || !newListName}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Your Lists</CardTitle>
          <CardDescription>
            A list of all your uploaded contact lists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Name</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-center">Contacts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lists.length > 0 ? (
                lists.map((list) => (
                  <TableRow
                    key={list.id}
                    onClick={() => handleRowClick(list)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{list.name}</TableCell>
                    <TableCell>{list.fileName}</TableCell>
                    <TableCell className="text-center">
                      {list.contacts.length.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(list.createdAt), 'PPP')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem onClick={() => handleDownload(list)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(list.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No contact lists uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Contact Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contact Preview: {selectedList?.name}</DialogTitle>
            <DialogDescription>
              Showing the first 100 contacts from {selectedList?.fileName}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedList?.contacts.slice(0, 100).map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell>{contact.firstName || '-'}</TableCell>
                    <TableCell>{contact.lastName || '-'}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
