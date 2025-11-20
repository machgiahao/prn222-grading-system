namespace SharedLibrary.Common.Constants;

public static class SystemRoles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Moderator = "Moderator";
    public const string Examiner = "Examiner";

    public const string AdminOrManager = Admin + "," + Manager;
}