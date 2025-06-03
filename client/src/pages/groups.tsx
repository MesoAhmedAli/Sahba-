import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema } from "@shared/schema";
import Navigation from "@/components/navigation";
import GroupCard from "@/components/group-card";
import { Users, Plus } from "lucide-react";
import type { Group, InsertGroup } from "@shared/schema";
import { z } from "zod";

const formSchema = insertGroupSchema.extend({
  name: z.string().min(1, "Group name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertGroup) => {
      const response = await apiRequest("POST", "/api/groups", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createGroupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Header */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Groups</h2>
              <p className="text-gray-600">Manage your friend groups and connections</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-bg text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a group to organize events with your friends.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. College Friends" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What's this group about?"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createGroupMutation.isPending}
                        className="gradient-bg text-white hover:opacity-90"
                      >
                        {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Groups List */}
        <section className="px-4 mb-8">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="border border-gray-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map(group => (
                <GroupCard key={group.id} group={group} showEvents />
              ))}
            </div>
          ) : (
            <Card className="border border-gray-100">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No groups yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first group to start organizing events with friends!
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gradient-bg text-white hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                      <DialogDescription>
                        Create a group to organize events with your friends.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Group Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. College Friends" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What's this group about?"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={createGroupMutation.isPending}
                            className="gradient-bg text-white hover:opacity-90"
                          >
                            {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
