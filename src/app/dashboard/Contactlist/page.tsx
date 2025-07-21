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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  uploadContactList,
  getContactLists,
  deleteContactList,
  downloadContactList,
} from '../../../services/api';

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
}

interface ContactList {
  _id: string;
  name: string;
  fileName: string;
  fileType: string;
  contacts: Contact[];
  createdAt: string;
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
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const data = await getContactLists();
      setLists(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch contact lists.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLists();
  }, []);

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
      const formData = new FormData();
      formData.append('name', newListName.trim());
      formData.append('file', fileToUpload);

      await uploadContactList(formData);
      await fetchLists();

      toast({
        title: 'List Uploaded',
        description: `Successfully uploaded "${newListName}".`,
      });

      setUploadDialogOpen(false);
      setNewListName('');
      setFileToUpload(null);
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload the contact list.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (listId: string) => {
    try {
      await deleteContactList(listId);
      setLists((prev) => prev.filter((list) => list._id !== listId));
      toast({
        title: 'List Deleted',
        description: 'The contact list has been successfully deleted.',
      });
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the contact list.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (list: ContactList) => {
    try {
      const blob = await downloadContactList(list._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${list.name}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: 'Download Failed',
        description: 'Could not download the contact list.',
        variant: 'destructive',
      });
    }
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

  {/* Matching Logic Note */}
  <Card className="bg-muted p-4 mb-4">
    <CardTitle className="text-base">Note:</CardTitle>
    <CardDescription className="text-sm mt-2">
      The system automatically matches the following fields from your uploaded file:
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li><strong>First Name</strong>: firstName, first_name, FirstName</li>
        <li><strong>Last Name</strong>: lastName, last_name, LastName</li>
        <li><strong>Email</strong>: email, Email (Required)</li>
      </ul>
      <p className="mt-2">
        Rows without a valid email address will be skipped automatically.
      </p>
    </CardDescription>
  </Card>

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
          <CardDescription>A list of all your uploaded contact lists.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
  <TooltipProvider key={list._id}>
    <Tooltip>
      <TooltipTrigger asChild>
        <TableRow
          onClick={() => {
            setSelectedList(list);
            setPreviewDialogOpen(true);
          }}
          className="cursor-pointer hover:bg-muted transition"
        >
          <TableCell className="font-medium">{list.name}</TableCell>
          <TableCell>{list.fileName}</TableCell>
          <TableCell className="text-center">{list.contacts.length}</TableCell>
          <TableCell>{format(new Date(list.createdAt), 'PPP')}</TableCell>
          <TableCell className="text-right">...</TableCell>
        </TableRow>
      </TooltipTrigger>

      <TooltipContent side="top" align="center">
        Click to preview contacts
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
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
          )}
        </CardContent>
      </Card>

      {/* Contact Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contact Preview: {selectedList?.name}</DialogTitle>
            {/* <DialogDescription>
              Showing the first 100 contacts from {selectedList?.fileName}.
            </DialogDescription> */}
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
                {selectedList?.contacts.map((contact, index) => (
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
